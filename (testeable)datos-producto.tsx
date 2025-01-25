import Aserrable from '@/components/productos/Aserrable';
import PrecioModal from '@/components/productos/PrecioModal';
import Pulpable from '@/components/productos/Pulpable';
import colors from '@/constants/colors';
import { initialStatesProducto } from '@/constants/initialStates';
import { useApp } from '@/context/app/AppContext';
import { useFolio } from '@/context/folio/FolioContext';
import { CAF } from '@/context/folio/types';
import { useUser } from '@/context/user/UserContext';
import {
  checkProductosValues,
  handleCreateGuiaLogic,
  handleIncreaseNumberOfClasesDiametricasLogic,
  handleSelectProductoLogic,
  handleSelectTipoLogic,
  handleUpdateBancoPulpableValueLogic,
  handleUpdateClaseDiametricaValueLogic,
  resetBancosPulpable,
} from '@/functions/datos-producto';
import {
  ClaseDiametricaGuia,
  GuiaDespachoFirestore,
} from '@/interfaces/firestore/guia';
import {
  Banco,
  IOptionProducto,
  IOptionTipoProducto,
  ProductoScreenOptions,
} from '@/interfaces/screens/emision/productos';
import {
  Select,
  SelectRef,
  SelectStyles,
} from '@mobile-reality/react-native-select-pro';
import { GeoPoint } from '@react-native-firebase/firestore';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateGuiaProductos(props: any) {
  const { navigation } = props;
  // const {
  //   guiaCreate,
  //   productosOptions,
  // }: {
  //   guiaCreate: GuiaDespachoFirestore;
  //   productosOptions: ProductoOptionObject[];
  // } = props.route.params.data;

  const guiaCreate = {
    codigo_contrato_externo: '',
    codigo_fsc: 'FSC CONTROLLED WOOD SA-CW-006947',
    contrato_compra_id: 'bizXpjoTyClb7mxVWxJH',
    contrato_venta_id: 'LZ2k53qEWzmHLZTVInZu',
    destino: {
      comuna: 'MACHALI',
      georreferencia: new GeoPoint(0, 0),
      nombre: 'Planta Villareal',
      rol: '111-018',
    },
    emisor: {
      actividad_economica: [],
      comuna: 'PADRE LAS CASAS',
      direccion: 'PARCELA 2 PUENTE EL SAPO',
      giro: 'Servicios Tecnologicos',
      razon_social: 'Alfa Trading Chile',
      rut: '77068553-2',
    },
    estado: '',
    folio_guia_proveedor: 0,
    identificacion: {
      folio: 447,
      tipo_despacho: 'Por cuenta del emisor a instalaciones cliente',
      tipo_traslado: 'Constituye venta',
    },
    monto_total_guia: 0,
    observaciones: [],
    precio_unitario_guia: 0,
    predio_origen: {
      certificado: 'SA-COC-007358',
      comuna: 'TRAIGUEN',
      georreferencia: new GeoPoint(0, 0),
      nombre: 'La Preferida',
      plan_de_manejo: '292/66-112/21',
      rol: '853-020',
    },
    producto: { calidad: '', codigo: '', especie: '', largo: 0, tipo: '', unidad: '' },
    proveedor: { razon_social: 'Bosques El Barraco', rut: '77601689- 6' },
    receptor: {
      comuna: 'CHILLAN',
      direccion: 'Ruta 5 - Los Coligues',
      giro: 'Servicios forestales',
      razon_social: 'Celulosas Valle Grande',
      rut: '93458000-1',
    },
    servicios: {},
    transporte: {
      camion: { marca: 'MERCEDES-BENZ', patente: 'DXVG-08', patente_carro: '' },
      carro: 'BB2233',
      chofer: { nombre: 'Hipólito Restendería Fisher', rut: '8166548-6' },
      empresa: { razon_social: 'Transportes Júpiter S.A.', rut: '93460000-2' },
      precio_unitario_transporte: 0,
    },
    usuario_metadata: {
      len_cafs: 0,
      len_folios_reservados: 0,
      usuario_email: '',
      usuario_id: '',
      version_app: '',
    },
    volumen_total_emitido: 0,
  };

  const productosOptions = [
    {
      calidad: 'Trozo Pulpable',
      codigo: 'TPEGPU244',
      especie: 'Euca Globulus',
      largo: '2.44',
      precio_unitario_compra_mr: 53000,
      precio_unitario_venta_mr: 60000,
      tipo: 'Pulpable',
      unidad: 'MR',
    },
  ];

  const {
    state: { empresa },
  } = useApp();
  const {
    state: { user },
    // updateUserReservedFolios,
  } = useUser();

  const { reserveFolios } = useFolio();

  const [guia, setGuia] = useState<GuiaDespachoFirestore>(guiaCreate);

  const [bancosPulpable, setBancosPulpable] = useState<Banco[]>(() =>
    resetBancosPulpable()
  );

  const [options, setOptions] = useState<ProductoScreenOptions>(
    initialStatesProducto.options
  );

  const productoRef = useRef() as MutableRefObject<SelectRef<IOptionProducto>>;
  const [modalVisible, setModalVisible] = useState(false);
  const [createGuiaLoading, setCreateGuiaLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleUpdateClaseDiametricaValue = (clase: string, cantidad: number) => {
    const newClasesDiametricas = handleUpdateClaseDiametricaValueLogic(
      guia.producto,
      clase,
      cantidad
    );

    setGuia((prevGuia) => ({
      ...prevGuia,
      producto: {
        ...prevGuia.producto,
        clases_diametricas: newClasesDiametricas,
      },
    }));
  };

  const handleIncreaseNumberOfClasesDiametricas = () => {
    const newClasesDiametricas = handleIncreaseNumberOfClasesDiametricasLogic(
      guia.producto.clases_diametricas as ClaseDiametricaGuia[]
    );

    setGuia((prevGuia) => ({
      ...prevGuia,
      producto: {
        ...prevGuia.producto,
        clases_diametricas: newClasesDiametricas,
      },
    }));
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

  const handleSelectTipo = (option: IOptionTipoProducto | null) => {
    const { newProducto, newOptions } = handleSelectTipoLogic(option, productosOptions);

    productoRef.current?.clear();

    setGuia((prevGuia) => ({
      ...prevGuia,
      producto: newProducto,
    }));
    setBancosPulpable(resetBancosPulpable());
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  };

  const handleSelectProducto = (option: IOptionProducto | null) => {
    const newProducto = handleSelectProductoLogic(option, guia.producto);

    setGuia((prevGuia) => ({
      ...prevGuia,
      producto: newProducto,
    }));

    setBancosPulpable(resetBancosPulpable());
    setRenderKey((prevKey) => prevKey + 1);
  };

  const onOpenModalButtonPress = () => {
    const allowOpen = checkProductosValues(guia.producto, bancosPulpable);
    setModalVisible(allowOpen);
  };

  const handleCreateGuia = async (precioUnitarioGuia: number) => {
    setCreateGuiaLoading(true);
    await handleCreateGuiaLogic(
      navigation,
      precioUnitarioGuia,
      user,
      empresa,
      guia,
      bancosPulpable,
      setCreateGuiaLoading,
      setModalVisible,
      (newReservedFolios: number[], newCafs?: CAF[]) =>
        new Promise((resolve) => resolve())
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        {isKeyboardVisible && (
          <TouchableOpacity
            style={styles.closeKeyboardButton}
            onPress={Keyboard.dismiss}
          >
            <Text style={styles.closeKeyboardText}>Cerrar Teclado</Text>
          </TouchableOpacity>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.section, { height: 120 }]}>
              <Text style={styles.sectionTitle}>Codigos Contrato Venta</Text>
              <Text style={{ marginTop: 10, marginLeft: 10 }}>
                Codigo FSC: {guia.codigo_fsc || 'Sin Codigo'}
              </Text>
              <Text style={{ marginTop: 10, marginLeft: 10 }}>
                Codigo Contrato Externo: {guia.codigo_contrato_externo || 'Sin Codigo'}
              </Text>
            </View>
            <View style={[styles.section, { height: 200 }]}>
              <Text style={styles.sectionTitle}>Producto</Text>
              <Select
                styles={selectStyles}
                placeholderTextColor="#cccccc"
                placeholderText="Seleccione el tipo del Producto"
                options={options.tipo}
                onSelect={handleSelectTipo}
                defaultOption={options.tipo.find(
                  (option) => option.value === guia.producto?.tipo
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
                  (option) => option.value === guia.producto.codigo
                )}
                disabled={guia.producto.tipo === '' || options.productos.length === 0}
                ref={productoRef}
                onSelect={handleSelectProducto}
                key={`producto-${renderKey}`}
                onRemove={() => handleSelectProducto(null)}
              />
            </View>
            <Text style={styles.sectionTitle}> Detalle </Text>
            {guia.producto.tipo === 'Aserrable' && guia.producto.codigo && (
              <View style={[styles.section, { flex: 1 }]}>
                <Aserrable
                  clasesDiametricas={guia.producto.clases_diametricas || []}
                  // TODO: prop drilling bad practice
                  updateClaseDiametricaValue={handleUpdateClaseDiametricaValue}
                  increaseNumberOfClasesDiametricas={
                    handleIncreaseNumberOfClasesDiametricas
                  }
                />
              </View>
            )}
            {guia.producto.tipo === 'Pulpable' && guia.producto.codigo && (
              <View style={[styles.section, { flex: 1 }]}>
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
            backgroundColor: guia.producto.calidad === '' ? 'grey' : colors.secondary,
          }}
          disabled={guia.producto.codigo === ''}
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
  },
  body: {
    flex: 9,
    width: '100%',
    backgroundColor: colors.white,
    display: 'flex',
  },
  row: {
    flex: 1,
    display: 'flex',
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
  closeKeyboardButton: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeKeyboardText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const selectStyles: SelectStyles = {
  select: {
    container: {
      // flex: 1,
      borderWidth: 2,
      marginTop: '2%',
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
  optionsList: {
    borderColor: '#cccccc',
    marginTop: Platform.OS === 'ios' ? 0 : 51,
  },
};
