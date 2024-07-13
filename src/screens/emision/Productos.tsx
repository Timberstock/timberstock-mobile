import { MutableRefObject, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Select,
  SelectRef,
  SelectStyles,
} from '@mobile-reality/react-native-select-pro';
import colors from '@/resources/Colors';
import Header from '@/components/Header';
import { UserContext } from '@/context/UserContext';
import Aserrable from '@/components/productos/Aserrable';
import Pulpable from '@/components/productos/Pulpable';
import { IOption } from '@/interfaces/screens/screens';
import PrecioModal from '@/components/productos/PrecioModal';
import {
  handleSelectProductoLogic,
  handleSelectTipoLogic,
  checkProductosValues,
  handleUpdateClaseDiametricaValueLogic,
  handleIncreaseNumberOfClasesDiametricasLogic,
  handleUpdateBancoPulpableValueLogic,
  handleCreateGuiaLogic,
} from './productosLogic';
import { GuiaDespacho } from '@/interfaces/screens/emision/create';
import { AppContext } from '@/context/AppContext';
import { initialStatesProducto } from '@/resources/initialStates';
import {
  Banco,
  ClaseDiametrica,
  IOptionProducto,
  ProductoOptions,
} from '@/interfaces/screens/emision/productos';
import { Producto } from '@/interfaces/esenciales';

// TODO: FINALIZE FROM GETTING THE PRODUCTO, IN PRODUCTOSLOGIC FILE THERE IS A FUNCTION THAT NEEDS TO BE IMPLEMENTED
// WE HAVE TO WORRY ABOUT CALCULATING THE CORRECT VOLUMENES ACCORDING TO THE TIPO, CORRECTLY CREATE GUIAS WITH SII AND FIRESTORE
// AND FINALLY ADD COSECHA, CARGUIO AND FOLIO_RECIBIDO SELECTIONS IN THE CREATE SCREEN.
// AFTER THAT, WE CAN MOVE TO THE PROFORMA

export default function CreateGuiaProductos(props: any) {
  const { navigation } = props;
  const { guia }: { guia: GuiaDespacho } = props.route.params.data;
  const { user, updateUserReservedFolios } = useContext(UserContext);
  const { empresa, contratosVenta } = useContext(AppContext);
  const productosData = guia.destino_contrato.productos;

  const [producto, setProducto] = useState<Producto>(
    initialStatesProducto.producto
  );
  const [clasesDiametricas, setClasesDiametricas] = useState<ClaseDiametrica[]>(
    initialStatesProducto.clases_diametricas
  );
  const [bancosPulpable, setBancosPulpable] = useState<Banco[]>(
    initialStatesProducto.bancos_pulpable
  );
  const [options, setOptions] = useState<ProductoOptions>(
    initialStatesProducto.options
  );

  const productoRef = useRef() as MutableRefObject<SelectRef<IOptionProducto>>;
  const [modalVisible, setModalVisible] = useState(false);
  const [createGuiaLoading, setCreateGuiaLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const handleUpdateClaseDiametricaValue = (
    clase: string,
    cantidad: number
  ) => {
    const newClasesDiametricas = handleUpdateClaseDiametricaValueLogic(
      producto,
      clasesDiametricas,
      clase,
      cantidad
    );
    setClasesDiametricas(newClasesDiametricas);
  };

  const handleIncreaseNumberOfClasesDiametricas = () => {
    const newClasesDiametricas =
      handleIncreaseNumberOfClasesDiametricasLogic(clasesDiametricas);

    setClasesDiametricas(newClasesDiametricas);
  };

  const handleUpdateBancoPulpableValue = (
    bancoIndex: number,
    dimension: keyof Banco,
    value: number
  ) => {
    const newBancosPulpable = handleUpdateBancoPulpableValueLogic(
      bancosPulpable,
      bancoIndex,
      dimension,
      value
    );

    setBancosPulpable(newBancosPulpable);
  };

  const handleSelectTipo = (option: IOption | null) => {
    const { newProducto, newOptions } = handleSelectTipoLogic(
      option,
      productosData
    );
    productoRef.current?.clear();
    setProducto(newProducto);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  };

  const handleSelectProduct = (option: IOptionProducto | null) => {
    const newProducto = handleSelectProductoLogic(option, producto);
    setProducto(newProducto);
    setRenderKey((prevKey) => prevKey + 1);
  };

  const onOpenModalButtonPress = () => {
    const allowOpen = checkProductosValues(
      producto,
      clasesDiametricas,
      bancosPulpable
    );

    setModalVisible(allowOpen);
  };

  const handleCreateGuia = async (precioUnitarioGuia: number) => {
    setCreateGuiaLoading(true);
    await handleCreateGuiaLogic(
      navigation,
      precioUnitarioGuia,
      user,
      guia,
      empresa,
      producto,
      contratosVenta,
      clasesDiametricas,
      bancosPulpable,
      setCreateGuiaLoading,
      setModalVisible,
      updateUserReservedFolios
    );
  };

  return (
    <View style={styles.screen}>
      <Header screenName="Products" empresa={empresa.razon_social} {...props} />
      <View style={styles.body}>
        {/* TODO: Fix the verticalOffset is showing a white rectangle */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={200}
        >
          <ScrollView style={styles.scrollView}>
            <View style={{ ...styles.section, ...styles.section.producto }}>
              <Text style={styles.sectionTitle}>Producto</Text>
              <Select
                styles={selectStyles}
                placeholderTextColor="#cccccc"
                placeholderText="Seleccione el tipo del Producto"
                options={options.tipo}
                onSelect={handleSelectTipo}
                defaultOption={options.tipo.find(
                  (option) => option.value === producto.tipo
                )}
                key={`tipo-${renderKey}`}
                onRemove={() => handleSelectTipo(null)}
              />
              <Select
                styles={selectStyles}
                placeholderTextColor="#cccccc"
                placeholderText="Seleccione el Producto"
                options={options.productos}
                defaultOption={options.productos.find(
                  (option) => option.value === producto.codigo
                )}
                disabled={producto.tipo === ''}
                ref={productoRef}
                onSelect={handleSelectProduct}
                key={`producto-${renderKey}`}
              />
            </View>
            <Text style={styles.sectionTitle}> Detalle </Text>
            {producto.tipo === 'Aserrable' && producto.codigo && (
              <View style={{ ...styles.section, ...styles.section.detalle }}>
                <Aserrable
                  clasesDiametricas={clasesDiametricas}
                  // TODO: prop drilling bad practice
                  updateClaseDiametricaValue={handleUpdateClaseDiametricaValue}
                  increaseNumberOfClasesDiametricas={
                    handleIncreaseNumberOfClasesDiametricas
                  }
                />
              </View>
            )}
            {producto.tipo === 'Pulpable' && producto.codigo && (
              <View style={{ ...styles.section, ...styles.section.detalle }}>
                <Pulpable
                  bancosPulpable={bancosPulpable}
                  // TODO: prop drilling bad practice
                  updateBancoPulpableValue={handleUpdateBancoPulpableValue}
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        <TouchableOpacity
          style={{
            ...styles.button,
            backgroundColor:
              producto.calidad === '' ? 'grey' : colors.secondary,
          }}
          disabled={producto.codigo === ''}
          onPress={onOpenModalButtonPress}
        >
          <Text style={styles.buttonText}> Crear Guía Despacho </Text>
        </TouchableOpacity>
      </View>
      <PrecioModal
        createGuiaLoading={createGuiaLoading}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        handleCreateGuia={handleCreateGuia}
      />
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
    backgroundColor: colors.crudo,
    borderRadius: 15,
    producto: {
      height: 175,
    },
    detalle: {
      flex: 1,
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

const selectStyles: SelectStyles = {
  select: {
    container: {
      // flex: 1,
      borderWidth: 2,
      marginTop: '4%',
      borderColor: '#cccccc',
      borderRadius: 13,
      alignSelf: 'center',
      width: '90%',
      // claseDiametrica: {
      //   flex: 0.5,
      //   marginRight: '4.5%',
      // },
    },
    // input: {
    //   borderWidth: 2,
    //   borderColor: '#cccccc',
    //   borderRadius: 13,
    //   alignSelf: 'center',
    //   width: '90%',
    //   folio: {
    //     width: '45%',
    //     alignSelf: 'center',
    //     marginLeft: '2.5%',
    //   },
    // },
    // buttonsContainer: {
    //   tintColor: colors.secondary,
    //   width: 10,
    //   alignSelf: 'center',
    //   alignContent: 'flex-end',
    //   alignItems: 'center',
    // },
  },
};
