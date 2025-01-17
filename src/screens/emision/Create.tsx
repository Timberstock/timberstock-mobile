// Arreglo de renderkeys para que se actualicen los selects desde https://github.com/MobileReality/react-native-select-pro/issues/237
import React, {
  useEffect,
  useRef,
  MutableRefObject,
  useContext,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import {
  Select,
  SelectRef,
  SelectStyles,
} from "@mobile-reality/react-native-select-pro";
import colors from "@/resources/Colors";
import Header from "@/components/Header";
import { AppContext } from "@/context/AppContext";
import { UserContext } from "@/context/UserContext";
import { IOption } from "@/interfaces/screens/screens";
import {
  GuiaDespachoOptions,
  IOptionClienteContratoCompra,
  IOptionDestinoContrato,
  IOptionTransporte,
  IOptionChofer,
  IOptionCarguio,
  IOptionCosecha,
  IOptionCamion,
} from "@/interfaces/screens/emision/create";
import {
  initialStateGuia,
  initialStatesOptionsCreate,
} from "@/resources/initialStates";
import {
  isGuiaValid,
  getInitialOptions,
  parseFoliosOptions,
  selectClienteLogic,
  selectProveedorLogic,
  selectTransporteLogic,
  selectChoferLogic,
  selectCamionLogic,
  selectFaenaLogic,
  selectDestinoContratoLogic,
  selectCarguioLogic,
  selectCosechaLogic,
  folioProveedorChangeLogic,
  selectCarroLogic,
} from "./createLogic";
import OverlayLoading from "@/components/OverlayLoading";
import { parseProductosFromContratos } from "./productosLogic";
import { GuiaDespachoFirestore } from "@/interfaces/firestore/guia";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

export default function CreateGuia(props: any) {
  const { navigation } = props;
  // const insets = useSafeAreaInsets();
  const { empresa, guiasSummary, contratosCompra, contratosVenta } =
    useContext(AppContext);
  const { user } = useContext(UserContext);

  const [guia, setGuia] = useState<GuiaDespachoFirestore>({
    ...initialStateGuia,
  });
  // Folios options is apart from the rest since it comes from the user, not contratos
  const [foliosOptions, setFoliosOptions] = useState<IOption[]>([]);
  const [options, setOptions] = useState<GuiaDespachoOptions>(
    initialStatesOptionsCreate,
  );

  const proveedorRef = useRef() as MutableRefObject<SelectRef>;
  const predioRef = useRef() as MutableRefObject<SelectRef>;
  const clienteRef = useRef() as MutableRefObject<
    SelectRef<IOptionClienteContratoCompra>
  >;
  const destinoContratoRef = useRef() as MutableRefObject<
    SelectRef<IOptionDestinoContrato>
  >;
  const empresaTransporteRef = useRef() as MutableRefObject<
    SelectRef<IOptionTransporte>
  >;
  const carguioRef = useRef() as MutableRefObject<SelectRef<IOptionCarguio>>;
  const cosechaRef = useRef() as MutableRefObject<SelectRef<IOptionCosecha>>;
  const choferRef = useRef() as MutableRefObject<SelectRef<IOptionChofer>>;
  const camionRef = useRef() as MutableRefObject<SelectRef<IOptionCamion>>;
  const carroRef = useRef() as MutableRefObject<SelectRef<IOption>>;

  const [optionsInitialized, setOptionsInitialized] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    // Run only once after loading contratosCompra
    if (!optionsInitialized && contratosCompra.length > 0 && user) {
      const newOptions = getInitialOptions(contratosCompra);
      const newFoliosOptions = parseFoliosOptions(
        user.folios_reservados,
        guiasSummary,
      );

      setRenderKey((prevKey) => prevKey + 1);
      setOptions(newOptions);
      setFoliosOptions(newFoliosOptions);
      setOptionsInitialized(true);
    }
  }, [contratosCompra]);

  const handleNavigateToCreateGuiaProductos = () => {
    if (!isGuiaValid(guia, options)) {
      alert("Debes llenar todos los campos");
      return;
    }

    const { contratoVenta, productosOptions } = parseProductosFromContratos(
      contratosCompra,
      contratosVenta,
      guia,
    );

    // Get the corresponding faena from the selected destino_contrato from the cliente selected
    const faenaContratoVenta = contratoVenta?.cliente.destinos_contrato
      .find((destino) => destino.nombre === guia.destino.nombre)
      ?.faenas.find((faena) => faena.rol === guia.predio_origen.rol);

    guia.codigo_fsc = faenaContratoVenta?.codigo_fsc || "";
    guia.codigo_contrato_externo =
      faenaContratoVenta?.codigo_contrato_externo || "";
    guia.contrato_venta_id = contratoVenta?.firestoreID || "";
    guia.receptor.giro = contratoVenta?.cliente.giro || "";

    if (!productosOptions || productosOptions.length === 0) {
      alert("No hay productos asociados a esta combinación");
      return;
    }

    if (!guia.contrato_venta_id) {
      Alert.alert(
        "Error",
        "No se encontró contrato de venta vigente para esta combinación cliente-destino-origen-producto",
      );
      return;
    }

    guia.emisor = {
      razon_social: empresa.razon_social,
      rut: empresa.rut,
      giro: empresa.giro,
      direccion: empresa.direccion,
      comuna: empresa.comuna,
      actividad_economica: empresa.actividad_economica,
    };

    // Clean up the observaciones array from empty strings
    guia.observaciones = guia.observaciones?.filter((obs) => obs !== "");

    navigation.push("CreateGuiaProductos", {
      data: {
        guiaCreate: guia,
        productosOptions: productosOptions,
      },
    });
    return;
  };

  function selectFolioHandler(option: IOption | null) {
    setGuia({
      ...guia,
      identificacion: {
        ...guia.identificacion,
        folio: parseInt(option?.value || "-1"),
      },
    });

    setRenderKey((prevKey) => prevKey);
  }

  function selectTipoDespachoHandler(option: IOption | null) {
    setGuia({
      ...guia,
      identificacion: {
        ...guia.identificacion,
        tipo_despacho: option?.value || "",
      },
    });
  }

  function selectTipoTrasladoHandler(option: IOption | null) {
    setGuia({
      ...guia,
      identificacion: {
        ...guia.identificacion,
        tipo_traslado: option?.value || "",
      },
    });
  }

  function selectProveedorHandler(option: IOption | null) {
    const { newGuia, newOptions } = selectProveedorLogic(
      option,
      guia,
      contratosCompra,
    );

    predioRef.current?.clear();
    clienteRef.current?.clear();
    destinoContratoRef.current?.clear();
    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function folioProveedorChangeHandler(folio: string) {
    const newGuia = folioProveedorChangeLogic(folio, guia);

    setGuia(newGuia);
  }

  function selectFaenaHandler(option: IOption | null) {
    const { newGuia, newOptions } = selectFaenaLogic(
      option,
      guia,
      contratosCompra,
    );

    clienteRef.current?.clear();
    destinoContratoRef.current?.clear();
    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectClienteHandler(option: IOptionClienteContratoCompra | null) {
    const { newGuia, newOptions } = selectClienteLogic(
      option,
      guia,
      contratosCompra,
    );

    destinoContratoRef.current?.clear();
    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectDestinoContratoHandler(option: IOptionDestinoContrato | null) {
    const { newGuia, newOptions } = selectDestinoContratoLogic(
      option,
      options,
      guia,
    );

    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectTransportistaHandler(option: IOptionTransporte | null) {
    const { newGuia, newOptions } = selectTransporteLogic(
      option,
      options,
      guia,
    );

    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectCarguioHandler(option: IOptionCarguio | null) {
    const newGuia = selectCarguioLogic(option, guia);

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
  }
  function selectCosechaHandler(option: IOptionCosecha | null) {
    const newGuia = selectCosechaLogic(option, guia);

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectChoferHandler(option: IOptionChofer | null) {
    const newGuia = selectChoferLogic(option, guia);

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectCamionHandler(option: IOptionCamion | null) {
    const newGuia = selectCamionLogic(option, guia);

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectCarroHandler(option: IOption | null) {
    const newGuia = selectCarroLogic(option, guia);

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function addObservacionHandler() {
    setGuia((prevGuia) => ({
      ...prevGuia,
      observaciones: [...(prevGuia.observaciones || []), ""], // Immutably add new observation
    }));
    setRenderKey((prevKey) => prevKey + 1);
  }

  function removeObservacionHandler(index: number) {
    setGuia((prevGuia) => ({
      ...prevGuia,
      observaciones: prevGuia.observaciones?.filter((_, i) => i !== index), // Immutably remove observation
    }));
    setRenderKey((prevKey) => prevKey + 1);
  }

  function observacionChangeHandler(index: number, text: string) {
    const newObservaciones = [...(guia.observaciones || [])];
    newObservaciones[index] = text;
    setGuia({ ...guia, observaciones: newObservaciones });
  }

  return (
    <View style={styles.screen}>
      <Header screenName="CreateGuia" empresa={"TimberBiz"} {...props} />
      <OverlayLoading loading={!optionsInitialized} />
      <View style={styles.body}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Identificación Guía </Text>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Nº Folio"
                  animation={true}
                  options={foliosOptions}
                  defaultOption={foliosOptions.find(
                    (option) =>
                      option.value === guia.identificacion.folio.toString(),
                  )}
                  onSelect={selectFolioHandler}
                  onRemove={() => selectFolioHandler(null)}
                  key={`folios-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Tipo Despacho"
                  animation={true}
                  options={options.tipoDespacho}
                  defaultOption={options.tipoDespacho.find(
                    (option) =>
                      option.value === guia.identificacion.tipo_despacho,
                  )}
                  onSelect={selectTipoDespachoHandler}
                  onRemove={() => selectTipoDespachoHandler(null)}
                />
              </View>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Tipo Traslado"
                  animation={true}
                  options={options.tipoTraslado}
                  defaultOption={options.tipoTraslado.find(
                    (option) =>
                      option.value === guia.identificacion.tipo_traslado,
                  )}
                  onSelect={selectTipoTrasladoHandler}
                  onRemove={() => selectTipoTrasladoHandler(null)}
                />
              </View>
            </View>
          </View>
          <View style={{ ...styles.section }}>
            <Text style={styles.sectionTitle}> Proveedor</Text>
            <Select
              styles={selectStyles}
              placeholderText="Proveedor"
              // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
              // searchable={true}
              animation={true}
              options={options.proveedores}
              ref={proveedorRef}
              defaultOption={options.proveedores.find(
                (option) => option.value === guia.proveedor.rut,
              )}
              onSelect={selectProveedorHandler}
              onRemove={() => selectProveedorHandler(null)}
              key={`proveedores-${renderKey}`}
            />
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                value={
                  guia.folio_guia_proveedor && guia.folio_guia_proveedor !== 0
                    ? guia.folio_guia_proveedor.toString()
                    : ""
                }
                placeholder={"Folio Proveedor (opcional)"}
                keyboardType="numeric"
                onChangeText={folioProveedorChangeHandler}
              />
            </View>
          </View>
          <View style={{ ...styles.section, ...styles.section.predio }}>
            <Text style={styles.sectionTitle}> Origen </Text>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Predio - Comuna"
                  // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
                  // searchable={true}
                  animation={true}
                  ref={predioRef}
                  options={options.faenas}
                  defaultOption={options.faenas.find(
                    (option) => option.value === guia.predio_origen.rol,
                  )}
                  disabled={guia.proveedor.razon_social === ""}
                  onSelect={selectFaenaHandler}
                  onRemove={() => selectFaenaHandler(null)}
                  key={`predios-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guia.predio_origen.rol && (
                  <Text style={styles.text}>Rol: {guia.predio_origen.rol}</Text>
                )}
                {guia.predio_origen.rol && (
                  <Text style={styles.text}>
                    GEO: {guia.predio_origen?.georreferencia.latitude},
                    {guia.predio_origen?.georreferencia.longitude}
                  </Text>
                )}
                {guia.predio_origen.rol && (
                  <Text style={styles.text}>
                    Plan de Manejo o Uso Suelo:{" "}
                    {guia.predio_origen.plan_de_manejo}
                  </Text>
                )}
              </View>
            </View>
            {guia.predio_origen.rol && (
              <View style={styles.textContainer}>
                <Text style={styles.text}>
                  Cert. Proveedor: {guia.predio_origen.certificado}
                </Text>
              </View>
            )}
          </View>
          <View style={{ ...styles.section, ...styles.section.receptor }}>
            <Text style={styles.sectionTitle}> Cliente </Text>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  placeholderText="Razon Social"
                  styles={selectStyles}
                  animation={true}
                  ref={clienteRef}
                  options={options.clientes}
                  disabled={
                    guia.predio_origen.rol === "" ||
                    guia.proveedor.razon_social === ""
                  }
                  defaultOption={options.clientes.find(
                    (option) => option.value === guia.receptor.rut,
                  )}
                  onSelect={selectClienteHandler}
                  onRemove={() => selectClienteHandler(null)}
                  key={`clientes-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guia.receptor.rut !== "" && (
                  <Text style={styles.text}>RUT: {guia.receptor.rut}</Text>
                )}
                {guia.receptor.rut !== "" && (
                  <Text style={styles.text}>
                    Direccion: {guia.receptor.direccion}, {guia.receptor.comuna}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  placeholderText="Direccion Despacho"
                  styles={selectStyles}
                  animation={true}
                  ref={destinoContratoRef}
                  options={options.destinos_contrato}
                  defaultOption={options.destinos_contrato.find(
                    (option) => option.value === guia.destino.nombre,
                  )}
                  disabled={
                    guia.proveedor.rut === "" ||
                    guia.predio_origen.rol === "" ||
                    guia.receptor.razon_social === ""
                  }
                  onSelect={selectDestinoContratoHandler}
                  onRemove={() => selectDestinoContratoHandler(null)}
                  key={`despachos-${renderKey}`}
                />
              </View>
            </View>
            <View />
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guia.destino.rol && (
                  <Text style={styles.text}>
                    Rol: {guia.destino.rol} || Comuna: {guia.destino.comuna}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Servicios </Text>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Select
                  styles={selectStyles}
                  placeholderText="Empresa Carguio"
                  animation={true}
                  ref={carguioRef}
                  options={options.empresas_carguio}
                  defaultOption={options.empresas_carguio.find(
                    (option) =>
                      option.value === guia.servicios?.carguio?.empresa.rut,
                  )}
                  disabled={
                    guia.proveedor.rut === "" ||
                    guia.predio_origen.rol === "" ||
                    guia.receptor.rut === "" ||
                    options.empresas_carguio.length === 0
                  }
                  onSelect={selectCarguioHandler}
                  onRemove={() => selectCarguioHandler(null)}
                  key={`carguio-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Select
                  styles={selectStyles}
                  placeholderText="Empresa Cosecha"
                  animation={true}
                  ref={cosechaRef}
                  options={options.empresas_cosecha}
                  defaultOption={options.empresas_cosecha.find(
                    (option) =>
                      option.value === guia.servicios?.cosecha?.empresa.rut,
                  )}
                  disabled={
                    guia.proveedor.rut === "" ||
                    guia.predio_origen.rol === "" ||
                    guia.receptor.rut === "" ||
                    options.empresas_cosecha.length === 0
                  }
                  onSelect={selectCosechaHandler}
                  onRemove={() => selectCosechaHandler(null)}
                  key={`cosecha-${renderKey}`}
                />
              </View>
            </View>
          </View>
          <View style={{ ...styles.section, ...styles.section.despacho }}>
            <Text style={styles.sectionTitle}> Datos Despacho </Text>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Select
                  styles={selectStyles}
                  placeholderText="Empresa Transportista"
                  animation={true}
                  ref={empresaTransporteRef}
                  options={options.empresas_transporte}
                  defaultOption={options.empresas_transporte.find(
                    (option) => option.value === guia.transporte.empresa.rut,
                  )}
                  disabled={
                    guia.proveedor.rut === "" ||
                    guia.receptor.rut === "" ||
                    guia.predio_origen.rol === "" ||
                    guia.destino.nombre === ""
                  }
                  onSelect={selectTransportistaHandler}
                  onRemove={() => selectTransportistaHandler(null)}
                  key={`transportistas-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Select
                  styles={selectStyles}
                  placeholderText="Chofer"
                  animation={true}
                  ref={choferRef}
                  options={options.choferes}
                  defaultOption={options.choferes.find(
                    (option) => option.value === guia.transporte.chofer.rut,
                  )}
                  disabled={
                    guia.proveedor.rut === "" ||
                    guia.receptor.rut === "" ||
                    guia.predio_origen.rol === "" ||
                    guia.destino.nombre === "" ||
                    guia.transporte.empresa.rut === ""
                  }
                  onSelect={selectChoferHandler}
                  onRemove={() => selectChoferHandler(null)}
                  key={`choferes-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Camion"
                  animation={true}
                  ref={camionRef}
                  options={options.camiones}
                  defaultOption={options.camiones.find(
                    (option) => option.value === guia.transporte.camion.patente,
                  )}
                  disabled={
                    guia.proveedor.rut === "" ||
                    guia.receptor.rut === "" ||
                    guia.predio_origen.rol === "" ||
                    guia.destino.nombre === "" ||
                    guia.transporte.empresa.rut === ""
                  }
                  onSelect={selectCamionHandler}
                  onRemove={() => selectCamionHandler(null)}
                  key={`camiones-${renderKey}`}
                />
              </View>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Carro"
                  animation={true}
                  ref={carroRef}
                  options={options.carros}
                  defaultOption={options.carros.find(
                    (option) => option.value === guia.transporte.carro,
                  )}
                  disabled={
                    guia.proveedor.rut === "" ||
                    guia.receptor.rut === "" ||
                    guia.predio_origen.rol === "" ||
                    guia.destino.nombre === "" ||
                    guia.transporte.empresa.rut === ""
                  }
                  onSelect={selectCarroHandler}
                  onRemove={() => selectCarroHandler(null)}
                  key={`carros-${renderKey}`}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              ...styles.section,
              height: 150 + (guia.observaciones?.length || 0) * 50,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ ...styles.sectionTitle }}>Observaciones</Text>
              <TouchableOpacity
                style={{
                  marginTop: "1%",
                  marginRight: "5%",
                }}
                onPress={addObservacionHandler}
              >
                <Icon
                  name="add-circle-outline"
                  size={40}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
            {guia.observaciones?.map((observacion, index) => (
              <View
                style={{
                  ...styles.container,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
                key={`view-${renderKey}-${index}`}
              >
                <TextInput
                  style={{ ...styles.input, width: "80%" }}
                  value={observacion}
                  placeholder={`Observacion ${index + 1}`}
                  maxLength={100}
                  key={`textinput-${renderKey}-${index}`}
                  onChangeText={(text) => {
                    observacionChangeHandler(index, text);
                  }}
                />
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    marginLeft: "2%",
                  }}
                  key={`touchable-${renderKey}-${index}`}
                  onPress={() => {
                    removeObservacionHandler(index);
                  }}
                >
                  <Icon
                    name="remove-circle-outline"
                    size={35}
                    color={colors.secondary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {/* Add an empty space */}
          <View style={{ height: 30 }} />
          <TouchableOpacity
            style={styles.button}
            onPress={handleNavigateToCreateGuiaProductos}
          >
            <Text style={styles.buttonText}> Agregar Productos </Text>
            <Icon
              name="arrow-forward"
              style={styles.icon}
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: "4%",
    height: 150,
    backgroundColor: colors.crudo,
    borderRadius: 15,
    receptor: {
      height: 250,
    },
    predio: {
      height: 230,
    },
    despacho: {
      height: 250,
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
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderStyle: "solid",
  },
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 2,
    backgroundColor: colors.white,
    padding: 7,
    borderColor: "#cccccc",
    borderRadius: 13,
    alignSelf: "center",
    width: "50%",
    textAlign: "center",
    marginVertical: 7,
    fontSize: 13,
  },
  text: {
    fontSize: 14,
    fontWeight: "normal",
    textAlign: "left",
    margin: 5,
  },

  // textCertificate: {
  //   fontSize: 14,
  //   fontWeight: "normal",
  //   alignSelf: "center",
  // },
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
    flexDirection: "row",
    width: "90%",
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    flex: 3,
  },
  icon: {
    flex: 1,
    right: 0,
    textAlign: "right",
    fontWeight: "bold",
  },
});

const selectStyles: SelectStyles = {
  select: {
    container: {
      borderWidth: 2,
      borderColor: "#cccccc",
      borderRadius: 13,
      alignSelf: "center",
      width: "90%",
    },
  },
  // optionsList: {
  //   borderColor: "#cccccc",
  //   marginTop: Platform.OS === "ios" ? 0 : 51,
  // },
};
