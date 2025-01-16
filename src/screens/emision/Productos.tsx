import {
  useRef,
  useState,
  useContext,
  useEffect,
  MutableRefObject,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import {
  Select,
  SelectRef,
  SelectStyles,
} from "@mobile-reality/react-native-select-pro";
import colors from "@/resources/Colors";
import Header from "@/components/Header";
import { UserContext } from "@/context/UserContext";
import Aserrable from "@/components/productos/Aserrable";
import Pulpable from "@/components/productos/Pulpable";
import PrecioModal from "@/components/productos/PrecioModal";
import {
  handleSelectProductoLogic,
  handleSelectTipoLogic,
  checkProductosValues,
  handleUpdateClaseDiametricaValueLogic,
  handleIncreaseNumberOfClasesDiametricasLogic,
  handleUpdateBancoPulpableValueLogic,
  handleCreateGuiaLogic,
  resetBancosPulpable,
} from "./productosLogic";
import { initialStatesProducto } from "@/resources/initialStates";
import {
  Banco,
  IOptionProducto,
  IOptionTipoProducto,
  ProductoOptionObject,
  ProductoScreenOptions,
} from "@/interfaces/screens/emision/productos";
import {
  ClaseDiametricaGuia,
  GuiaDespachoFirestore,
} from "@/interfaces/firestore/guia";
import { AppContext } from "@/context/AppContext";

export default function CreateGuiaProductos(props: any) {
  const { navigation } = props;
  const {
    guiaCreate,
    productosOptions,
  }: {
    guiaCreate: GuiaDespachoFirestore;
    productosOptions: ProductoOptionObject[];
  } = props.route.params.data;

  const { empresa } = useContext(AppContext);
  const { user, updateUserReservedFolios } = useContext(UserContext);

  const [guia, setGuia] = useState<GuiaDespachoFirestore>(guiaCreate);

  const [bancosPulpable, setBancosPulpable] = useState<Banco[]>(() =>
    resetBancosPulpable(),
  );

  const [options, setOptions] = useState<ProductoScreenOptions>(
    initialStatesProducto.options,
  );

  const productoRef = useRef() as MutableRefObject<SelectRef<IOptionProducto>>;
  const [modalVisible, setModalVisible] = useState(false);
  const [createGuiaLoading, setCreateGuiaLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleUpdateClaseDiametricaValue = (
    clase: string,
    cantidad: number,
  ) => {
    const newClasesDiametricas = handleUpdateClaseDiametricaValueLogic(
      guia.producto,
      clase,
      cantidad,
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
      guia.producto.clases_diametricas as ClaseDiametricaGuia[],
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
    value: number,
  ) => {
    const newBancosPulpable = handleUpdateBancoPulpableValueLogic(
      bancosPulpable,
      bancoIndex,
      dimension,
      value,
    );

    setBancosPulpable(newBancosPulpable);
  };

  const handleSelectTipo = (option: IOptionTipoProducto | null) => {
    const { newProducto, newOptions } = handleSelectTipoLogic(
      option,
      productosOptions,
    );

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
      updateUserReservedFolios,
    );
  };

  return (
    <View style={styles.screen}>
      <Header screenName="Products" empresa={"TimberBiz"} {...props} />
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ ...styles.section, ...styles.section.codigos }}>
              <Text style={styles.sectionTitle}>Codigos Contrato Venta</Text>
              <Text style={{ marginTop: 10, marginLeft: 10 }}>
                Codigo FSC: {guia.codigo_fsc || "Sin Codigo"}
              </Text>
              <Text style={{ marginTop: 10, marginLeft: 10 }}>
                Codigo Contrato Externo:{" "}
                {guia.codigo_contrato_externo || "Sin Codigo"}
              </Text>
            </View>
            <View
              style={{
                ...styles.section,
                ...styles.section.producto,
              }}
            >
              <Text style={styles.sectionTitle}>Producto</Text>
              <Select
                styles={selectStyles}
                placeholderTextColor="#cccccc"
                placeholderText="Seleccione el tipo del Producto"
                options={options.tipo}
                onSelect={handleSelectTipo}
                defaultOption={options.tipo.find(
                  (option) => option.value === guia.producto?.tipo,
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
                  (option) => option.value === guia.producto.codigo,
                )}
                disabled={
                  guia.producto.tipo === "" || options.productos.length === 0
                }
                ref={productoRef}
                onSelect={handleSelectProducto}
                key={`producto-${renderKey}`}
                onRemove={() => handleSelectProducto(null)}
              />
            </View>
            <Text style={styles.sectionTitle}> Detalle </Text>
            {guia.producto.tipo === "Aserrable" && guia.producto.codigo && (
              <View style={{ ...styles.section, ...styles.section.detalle }}>
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
            {guia.producto.tipo === "Pulpable" && guia.producto.codigo && (
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
              guia.producto.calidad === "" ? "grey" : colors.secondary,
          }}
          disabled={guia.producto.codigo === ""}
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
    display: "flex",
    flexDirection: "row",
    backgroundColor: "grey",
    borderRadius: 12,
    padding: "2.5%",
    marginHorizontal: "2.5%",
    marginVertical: "1.5%",
    justifyContent: "center",
  },
  listItem: {
    flex: 6,
  },
  listIcon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginTop: "1%",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: "2.5%",
  },
  scrollView: {
    width: "100%",
    height: "100%",
  },
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: "2%",
    paddingTop: "2%",
    backgroundColor: colors.crudo,
    borderRadius: 15,
    codigos: {
      height: 120,
    },
    producto: {
      height: 200,
    },
    detalle: {
      flex: 1,
    },
  },
  body: {
    flex: 9,
    width: "100%",
    backgroundColor: colors.white,
    display: "flex",
  },
  row: {
    flex: 1,
    dispaly: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  input: {
    borderWidth: 2,
    height: 35,
    backgroundColor: colors.white,
    padding: 7,
    borderColor: "#cccccc",
    borderRadius: 13,
    alignSelf: "center",
    width: "40%",
  },
  container: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "normal",
    textAlign: "left",
    margin: 5,
    marginLeft: "6%",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 15,
    margin: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
  },
  buttonLittle: {
    paddingVertical: 7,
    width: "40%",
  },
  buttonText: {
    color: colors.white,
  },
  buttonTextLittle: {
    fontSize: 12,
  },
  closeKeyboardButton: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
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
    fontWeight: "bold",
  },
});

const selectStyles: SelectStyles = {
  select: {
    container: {
      // flex: 1,
      borderWidth: 2,
      marginTop: "2%",
      borderColor: "#cccccc",
      borderRadius: 13,
      alignSelf: "center",
      width: "90%",
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
