import {
  MutableRefObject,
  useRef,
  useEffect,
  useState,
  useContext,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import colors from '../resources/Colors';
import Header from '../components/Header';
import { Select, SelectRef } from '@mobile-reality/react-native-select-pro';
import { AppContext } from '../context/AppContext';
import { getProductosOptions, tipoOptions } from '../resources/options';
import { UserContext } from '../context/UserContext';
import OverlayLoading from '../resources/OverlayLoading';
import { createGuiaDoc } from '../functions/firebase/firestore/guias';
import Aserrable from '../components/productos/Aserrable';
import Pulpable from '../components/productos/Pulpable';
import { IOption } from '../interfaces/screens';
import { ProductoDetalle } from '../interfaces/firestore';
import { tipoProductHooks } from '../functions/screenHooks';
import {
  generatePDF,
  handleSelectProductoLogic,
} from '../functions/screenFunctions';
import PrecioModal from '../components/productos/PrecioModal';
import customHelpers from '../functions/helpers';
import { ContratoVenta } from '../interfaces/contratos/contratoVenta';
import { ContratosFiltered } from '../interfaces/screens/createGuia';

export default function Products(props: any) {
  // TODO: Add reference to the contratoVenta and Compra where the data was taken from

  // get data from args or call props
  const { navigation } = props;
  const {
    guia,
    contratosFiltered,
  }: { guia: any; contratosFiltered: ContratosFiltered } =
    props.route.params.data;
  const [renderKey, setRenderKey] = useState(0);

  const contratoVenta = contratosFiltered.venta[0];
  console.log(contratoVenta);
  const { user, updateUserReservedFolios } = useContext(UserContext);
  const { subCollectionsData } = useContext(AppContext);

  // Main states
  const [productOptions, setProductOptions] = useState<IOption[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // This would have to be managed with redux or context API to be able to persist
  // the state of the products in other screens (e.g pressing back here)
  const emptyProduct = {
    especie: '',
    tipo: '',
    calidad: '',
    largo: 0,
    cantidad: 0,
    precio_ref: 0,
    unidad: '',
    volumen: 0,
  };
  const [actualProduct, setActualProduct] =
    useState<ProductoDetalle>(emptyProduct);

  // States depending on actualProduct.tipo
  const {
    clasesDiametricas,
    updateClaseDiametricaValue,
    increaseNumberOfClasesDiametricas,
    bancosPulpable,
    updateBancoPulpableValue,
  } = tipoProductHooks();

  // Needed for visual purposes
  const actualProductRef = useRef() as MutableRefObject<SelectRef>;
  const [createGuiaLoading, setCreateGuiaLoading] = useState(false);

  console.log(productOptions);

  const handleSelectTipo = (option: any) => {
    // Whenever the tipo is changed, reset the actualProduct and assign the new tipo

    setActualProduct({ ...emptyProduct, tipo: option?.value || null });
    // const newOptions =
    //   getProductosOptions(
    //     subCollectionsData.productos,
    //     option?.value || null
    //   ) || [];
    const productosOptions = getProductosOptions(
      contratoVenta.productos,
      option?.value || null
    );

    // necessary because setting tipo to null does not change visually the new selected option as null for actualProduct
    actualProductRef.current?.clear();

    setProductOptions(productosOptions);
    setRenderKey((prevKey) => prevKey + 1);
  };

  // TODO: fix type
  const handleSelectProduct = (option: any) => {
    // If valid option parse the option string to a ProductoDetalle object
    const newActualProduct = option?.value
      ? // ? handleSelectProductoLogic(option, subCollectionsData)
        handleSelectProductoLogic(option, contratoVenta)
      : // Else just keep the old tipo and reset the actualProduct
        {
          ...emptyProduct,
          tipo: actualProduct.tipo,
        };
    setActualProduct(newActualProduct);
  };

  const onOpenModalButtonPress = () => {
    let allowed = false;
    // Check if the user has entered any value in the products actual values
    // TODO FIRST: FIX THIS VALIDATION
    if (actualProduct.tipo === 'Aserrable') {
      for (const value of Object.values(clasesDiametricas)) {
        if (value !== 0) {
          // If any aserrable product has any valid clase diametrica, allow
          allowed = true;
          break;
        }
      }
    } else if (actualProduct.tipo === 'Pulpable') {
      for (const value of Object.values(bancosPulpable)) {
        if (value.altura1 !== 0 && value.altura2 !== 0 && value.ancho !== 0) {
          // If any pulpable product has any valid banco, allow
          allowed = true;
          break;
        }
      }
    }
    if (!allowed) {
      Alert.alert(
        'Error',
        'No se puede crear una guía con todos los valores en 0'
      );
      return;
    }
    setModalVisible(true);
  };

  const handleCreateGuia = async (totalGuia: number) => {
    try {
      if (guia.total > 2147483647) {
        Alert.alert('Error', 'El total no puede ser mayor a 2147483647');
        return;
      }
      setCreateGuiaLoading(true);
      if (user && user.firebaseAuth && user.empresa_id) {
        // products depend on actualProduct.tipo
        guia.productos =
          actualProduct.tipo === 'Aserrable'
            ? customHelpers.buildAserrableProductsArray(
                actualProduct,
                clasesDiametricas
              )
            : customHelpers.buildPulpableProductArray(
                actualProduct,
                bancosPulpable
              );

        guia.volumen_total = guia.productos.reduce(
          (acc: any, product: any) => acc + product.volumen,
          0
        );
        guia.total = totalGuia;
        guia.total_ref = Math.trunc(
          actualProduct.precio_ref * guia.volumen_total
        );

        // Divide the total amount by the total volume of products to get the "non_ref_price"
        guia.precio = Math.trunc(totalGuia / guia.volumen_total);
        // Same as guia
        guia.precio_ref = actualProduct.precio_ref;

        // When we upload guias, we need Firebase to be able to parse the date correctly

        // We retrieve the date on which the guia was created as ISOString for consistency and not using Date (mutable object warning)
        const guiaDate = await createGuiaDoc(user.empresa_id, guia); // Not sure if this is actually waiting for the function to finish

        const CAF = user.cafs[Math.floor((guia.identificacion.folio - 1) / 5)];

        // We have to add the 'as string' because in case of error createGuiaDoc returns nothing
        await generatePDF(guia, guiaDate as string, CAF);

        // Remove the folio from the list of folios_reserved
        const newFoliosReserved = user.folios_reservados.filter(
          (folio) => folio !== guia.identificacion.folio
        );
        // Update the user's folios locally popping the one just used
        await updateUserReservedFolios(newFoliosReserved);
      }
      setCreateGuiaLoading(false);
      setModalVisible(false);
      navigation.push('Home');
    } catch (e) {
      console.log(e);
      setCreateGuiaLoading(false);
      Alert.alert('Error', 'No se pudo crear la guia de despacho');
    }
  };
  return (
    <View style={styles.screen}>
      <Header
        screenName="Products"
        empresa={guia.emisor.razon_social}
        {...props}
      />
      <View style={styles.body}>
        {/* TODO: Fix the verticalOffset is showing a white rectangle */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={200}
        >
          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>Producto</Text>

            <View style={{ ...styles.section, ...styles.section.producto }}>
              <View style={styles.row}>
                <Select
                  selectContainerStyle={selectStyles.container}
                  // @ts-ignore
                  selectControlStyle={{
                    ...selectStyles.input,
                  }}
                  placeholderTextColor="#cccccc"
                  placeholderText="Seleccione el tipo del Producto"
                  selectControlArrowImageStyle={selectStyles.buttonsContainer}
                  options={tipoOptions}
                  onSelect={handleSelectTipo}
                  key={`tipo-${renderKey}`}
                />
              </View>
              <View style={styles.row}>
                <Select
                  selectContainerStyle={selectStyles.container}
                  // @ts-ignore
                  selectControlStyle={{
                    ...selectStyles.input,
                    backgroundColor: props.disabled ? 'grey' : colors.white,
                  }}
                  placeholderTextColor="#cccccc"
                  placeholderText="Seleccione el Producto"
                  selectControlArrowImageStyle={selectStyles.buttonsContainer}
                  options={productOptions}
                  disabled={actualProduct?.tipo === null}
                  ref={actualProductRef}
                  onSelect={handleSelectProduct}
                  key={`producto-${renderKey}`}
                />
              </View>
            </View>
            <Text style={styles.sectionTitle}> Detalle </Text>
            {actualProduct?.tipo === 'Aserrable' ? (
              <View style={{ ...styles.section, ...styles.section.detalle }}>
                <Aserrable
                  clasesDiametricas={clasesDiametricas}
                  // TODO: prop drilling bad practice
                  updateClaseDiametricaValue={updateClaseDiametricaValue}
                  increaseNumberOfClasesDiametricas={
                    increaseNumberOfClasesDiametricas
                  }
                />
              </View>
            ) : actualProduct?.tipo === 'Pulpable' ? (
              <View style={{ ...styles.section, ...styles.section.detalle }}>
                <Pulpable
                  bancosPulpable={bancosPulpable}
                  // TODO: prop drilling bad practice
                  updateBancoPulpableValue={updateBancoPulpableValue}
                />
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
        <TouchableOpacity
          style={{
            ...styles.button,
            backgroundColor:
              actualProduct.calidad === '' ? 'grey' : colors.secondary,
          }}
          disabled={actualProduct.calidad === ''}
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
