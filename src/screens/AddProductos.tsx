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
import { handleSelectProductoLogic } from '../functions/screenFunctions';
import { productosOptions, claseDiametricaOptions } from '../resources/options';
import { Trozo } from '../interfaces/firestore';
import Icon from 'react-native-vector-icons/AntDesign';
import { AppContext } from '../context/AppContext';
import { UserContext } from '../context/UserContext';
import OverlayLoading from '../resources/OverlayLoading';
import { createGuiaDoc } from '../functions/firebase/firestore/guias';
import { generatePDF } from '../functions/screenFunctions';

export default function AddProductos(props: any) {
  const { navigation } = props;
  const { user } = useContext(UserContext);
  const { subCollectionsData } = useContext(AppContext);
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(false);
  const cantidadRef = useRef() as MutableRefObject<TextInput>;

  const { guia } = props.route.params.data;
  const claseDiametricaRef = useRef() as MutableRefObject<SelectRef>;

  const productosOpts = productosOptions(subCollectionsData.productos) || [];

  // This would have to be managed with redux or context API to be able to persist
  // the state of the products in other screens (e.g pressing back here)
  const [actualTrozo, setActualTrozo] = useState<Trozo>({
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
    (acc: number, producto: Trozo) =>
      acc + (producto.total !== undefined ? producto.total : 0),
    0
  );
  const handleSelectProducto = (option: any) => {
    handleSelectProductoLogic(
      option,
      subCollectionsData,
      claseDiametricaRef,
      actualTrozo,
      setActualTrozo
    );
  };

  const handleSelectClaseDiametrica = (option: any) => {
    setActualTrozo({
      ...actualTrozo,
      claseDiametrica: option?.value || null,
    });
  };

  const handleAddProducto = () => {
    // TODO ALSO AVOID ADDING WHEN NOT CLASE DIAMETRICA IS SELECTED AND IS ASERRABLE
    if (actualTrozo) {
      const newTrozo = actualTrozo;
      let volumen = 0;
      if (actualTrozo.tipo === 'Aserrable' && actualTrozo.claseDiametrica) {
        newTrozo.unidad = 'm3';
        volumen =
          cantidad *
          actualTrozo.largo *
          Math.PI *
          (parseFloat(actualTrozo.claseDiametrica) / (2 * 100)) ** 2; // pasamos diametro de centimetros a metros
      } else {
        newTrozo.unidad = 'mr';
        volumen = cantidad * actualTrozo.largo;
      }
      newTrozo.total = Math.trunc(volumen * actualTrozo.precio_ref);
      newTrozo.volumen = volumen;
      newTrozo.cantidad = cantidad;
      setActualTrozo(newTrozo);
      setProductosAdded([...productosAdded, newTrozo]);
      setCantidad(0);
      cantidadRef.current.blur();
    }
  };

  const handleCreateGuia = async () => {
    try {
      guia.productos = productosAdded;
      guia.total = total;
      // TODO: actually, int32 only accepts numbers between -2,147,483,648 and 2,147,483,647
      if (guia.total > 2147483647) {
        Alert.alert('Error', 'El total no puede ser mayor a 2147483647');
        return;
      }
      setLoading(true);
      console.log('Creando Guía...');
      if (user?.empresa_id) {
        guia.precio_ref = productosAdded[0].precio_ref;
        guia.identificacion.fecha = new Date().toISOString();
        console.log(guia);
        await createGuiaDoc(user.empresa_id, guia); // Not sure if this is actually waiting for the function to finish
        await generatePDF(guia);
      }
      setLoading(false);

      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: 'Home' }],
      // });
      navigation.push('Home');
    } catch (e) {
      console.log(e);
      setLoading(false);
      Alert.alert('Error', 'No se pudo crear la guia de despacho');
    }
  };

  const renderItem = ({ item }: { item: Trozo }) => {
    const producto = item;
    const handleDeleteProducto = () => {
      const index = productosAdded.indexOf(item);
      const newProductosAdded = productosAdded.filter(
        (_producto: Trozo, i: number) => i !== index
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
              disabled={actualTrozo?.tipo !== 'Aserrable'}
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
