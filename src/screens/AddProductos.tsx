import { MutableRefObject, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import colors from '../resources/Colors';
import Header from '../components/Header';
import { Select, SelectRef } from '@mobile-reality/react-native-select-pro';
import {
  handleSelectProductoLogic,
  createGuiaDespacho,
  handleFetchFirebase,
} from '../functions/screenFunctions';
import { productosOptions, claseDiametricaOptions } from '../resources/options';
import { ProductoAdded } from '../interfaces/firestore';
import Icon from 'react-native-vector-icons/AntDesign';
import { AppContext } from '../context/AppContext';
import { UserContext } from '../context/UserContext';
import OverlayLoading from '../resources/OverlayLoading';

export default function AddProductos(props: any) {
  const { navigation } = props;
  const { user } = useContext(UserContext);
  const { guiasSummary, updateGuiasSummary, retrievedData } =
    useContext(AppContext);
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(false);
  const cantidadRef = useRef() as MutableRefObject<TextInput>;

  const { guia } = props.route.params.data;
  const claseDiametricaRef = useRef() as MutableRefObject<SelectRef>;

  const productosOpts = productosOptions(retrievedData.productos) || [];

  // This would have to be managed with redux or context API to be able to persist
  // the state of the products in other screens (e.g pressing back here)
  const [actualProducto, setActualProducto] = useState<ProductoAdded>({
    especie: '',
    tipo: '',
    calidad: '',
    largo: 0,
    cantidad: 0,
    precio_ref: 0,
    unidad: '',
    volumen: 0,
  });
  const [productosAdded, setProductosAdded] = useState<any>([]);
  const total = productosAdded.reduce(
    (acc: number, producto: ProductoAdded) =>
      acc + (producto.total !== undefined ? producto.total : 0),
    0
  );
  const handleSelectProducto = (option: any) => {
    handleSelectProductoLogic(
      option,
      retrievedData,
      claseDiametricaRef,
      actualProducto,
      setActualProducto
    );
  };

  const handleSelectClaseDiametrica = (option: any) => {
    setActualProducto({
      ...actualProducto,
      claseDiametrica: option?.value || null,
    });
  };

  const handleAddProducto = () => {
    // TODO ALSO AVOID ADDING WHEN NOT CLASE DIAMETRICA IS SELECTED AND IS ASERRABLE
    if (actualProducto) {
      const newActualProducto = actualProducto;
      let volumen = 0;
      if (
        actualProducto.tipo === 'Aserrable' &&
        actualProducto.claseDiametrica
      ) {
        newActualProducto.unidad = 'm3';
        volumen =
          cantidad *
          actualProducto.largo *
          Math.PI *
          (parseFloat(actualProducto.claseDiametrica) / (2 * 100)) ** 2; // pasamos diametro de centimetros a metros
      } else {
        newActualProducto.unidad = 'mr';
        volumen = cantidad * actualProducto.largo;
      }
      newActualProducto.total = Math.trunc(volumen * actualProducto.precio_ref);
      newActualProducto.volumen = volumen;
      newActualProducto.cantidad = cantidad;
      setActualProducto(newActualProducto);
      setProductosAdded([...productosAdded, newActualProducto]);
      setCantidad(0);
      cantidadRef.current.blur();
    }
  };

  const handleCreateGuia = async () => {
    try {
      guia.productos = productosAdded;
      guia.total = total;
      guia.identificacion.fecha = new Date();
      // TODO: actually, int32 only accepts numbers between -2,147,483,648 and 2,147,483,647
      if (guia.total > 2147483647) {
        Alert.alert('Error', 'El total no puede ser mayor a 2147483647');
        return;
      }
      setLoading(true);
      // just typescript things -.-
      if (user?.empresa_id) await createGuiaDespacho(user.empresa_id, guia);
      const newGuia = guia;
      newGuia.productos = productosAdded;
      newGuia.total = total;
      const newGuias = guiasSummary;
      const newGuiaSummary = {
        folio: newGuia.identificacion.folio,
        estado: newGuia.estado,
        total: newGuia.total,
        receptor: newGuia.receptor,
        fecha: newGuia.identificacion.fecha,
        url: '',
      };
      newGuias.unshift(newGuiaSummary);
      updateGuiasSummary(newGuias);
      // We only need to do this to update foliosOptions with the new info
      const { empresaGuias }: any = await handleFetchFirebase(user?.empresa_id);
      updateGuiasSummary(empresaGuias || []);
      Alert.alert('Guía creada con éxito');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      navigation.push('Home');
    } catch (e) {
      console.log(e);
      setLoading(false);
      Alert.alert('Error', 'No se pudo crear la guia de despacho');
    }
  };

  const renderItem = ({ item }: { item: ProductoAdded }) => {
    const producto = item;
    const handleDeleteProducto = () => {
      const index = productosAdded.indexOf(item);
      const newProductosAdded = productosAdded.filter(
        (_producto: ProductoAdded, i: number) => i !== index
      );
      setProductosAdded(newProductosAdded);
    };
    return (
      <View style={styles.listContainer}>
        <View style={styles.listItem}>
          <Text>
            {' '}
            Producto: {producto.especie} {producto.tipo} {producto.calidad}{' '}
            {producto.largo}m
          </Text>
          <Text>
            {producto.claseDiametrica
              ? `Clase Diametrica: ${producto.claseDiametrica}`
              : null}
          </Text>
          <Text> Cantidad: {producto.cantidad}</Text>
        </View>
        <TouchableOpacity
          style={styles.listIcon}
          onPress={handleDeleteProducto}
        >
          <Icon name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Header
        screenName="AddProductos"
        empresa={guia.emisor.razon_social}
        {...props}
      />
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Productos</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Select
              selectContainerStyle={selectStyles.container}
              // @ts-ignore
              selectControlStyle={{
                ...selectStyles.input,
              }}
              placeholderTextColor="#cccccc"
              placeholderText="Seleccione el Producto"
              selectControlArrowImageStyle={selectStyles.buttonsContainer}
              options={productosOpts}
              onSelect={handleSelectProducto}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.text}>Clase Diamétrica</Text>
            <Select
              selectContainerStyle={{
                ...selectStyles.container,
                ...selectStyles.container.claseDiametrica,
              }}
              // @ts-ignore
              selectControlStyle={{
                ...selectStyles.input,
              }}
              placeholderText=""
              placeholderTextColor="#cccccc"
              disabled={actualProducto?.tipo !== 'Aserrable'}
              selectControlArrowImageStyle={selectStyles.buttonsContainer}
              ref={claseDiametricaRef}
              options={claseDiametricaOptions}
              onSelect={handleSelectClaseDiametrica}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Cantidad"
                keyboardType="decimal-pad"
                // TODO ASAP: ALLOW DECIMAL NUMBERS
                value={cantidad ? cantidad.toString() : ''}
                ref={cantidadRef}
                onChangeText={(text) => {
                  setCantidad(parseFloat(text));
                }}
              />
            </View>
          </View>
          <TouchableOpacity
            disabled={cantidad === 0}
            style={{
              ...styles.button,
              ...styles.buttonLittle,
              backgroundColor: props.disabled ? 'grey' : colors.secondary,
            }}
            onPress={handleAddProducto}
          >
            <Text style={{ ...styles.buttonText, ...styles.buttonTextLittle }}>
              {' '}
              Agregar{' '}
            </Text>
          </TouchableOpacity>
        </View>
        <Text> Total: {total} </Text>
        <FlatList data={productosAdded} renderItem={renderItem} />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText} onPress={handleCreateGuia}>
            {' '}
            Crear Guía Despacho{' '}
          </Text>
        </TouchableOpacity>
      </View>
      <OverlayLoading loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'grey',
    borderRadius: 12,
    padding: '2.5%',
    marginHorizontal: '2.5%',
    marginVertical: '1.5%',
    justifyContent: 'center',
  },
  listItem: {
    flex: 6,
  },
  listIcon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    marginTop: '1%',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: '2.5%',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: '2%',
    paddingTop: '2%',
    height: 200,
    backgroundColor: colors.crudo,
    borderRadius: 15,
    receptor: {
      height: 200,
    },
    predio: {
      height: 230,
    },
  },
  body: {
    flex: 9,
    width: '100%',
    backgroundColor: colors.white,
    display: 'flex',
  },
  row: {
    flex: 1,
    dispaly: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  input: {
    borderWidth: 2,
    height: 35,
    backgroundColor: colors.white,
    padding: 7,
    borderColor: '#cccccc',
    borderRadius: 13,
    alignSelf: 'center',
    width: '40%',
  },
  container: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    margin: 5,
    marginLeft: '6%',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 15,
    margin: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
  },
  buttonLittle: {
    paddingVertical: 7,
    width: '40%',
  },
  buttonText: {
    color: colors.white,
  },
  buttonTextLittle: {
    fontSize: 12,
  },
});

const selectStyles = StyleSheet.create({
  container: {
    flex: 1,
    claseDiametrica: {
      flex: 0.5,
      marginRight: '4.5%',
    },
  },
  input: {
    borderWidth: 2,
    borderColor: '#cccccc',
    borderRadius: 13,
    alignSelf: 'center',
    width: '90%',
    folio: {
      width: '45%',
      alignSelf: 'center',
      marginLeft: '2.5%',
    },
  },
  buttonsContainer: {
    tintColor: colors.secondary,
    width: 10,
    alignSelf: 'center',
    alignContent: 'flex-end',
    alignItems: 'center',
  },
});
