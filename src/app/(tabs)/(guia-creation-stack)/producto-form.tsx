import Aserrable from '@/components/productos/Aserrable';
import PrecioModal from '@/components/productos/PrecioModal';
import Pulpable from '@/components/productos/Pulpable';
import colors from '@/constants/colors';
import { useGuiaForm } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { useProductoForm } from '@/context/guia-creation/producto-form/ProductoFormContext';
import { Select, SelectStyles } from '@mobile-reality/react-native-select-pro';
import { useEffect, useState } from 'react';
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

export default function ProductoForm() {
  const {
    state: { guia },
  } = useGuiaForm();

  const {
    state: { productoForm, options },
    updateTipo,
    updateProductoInfo,
  } = useProductoForm();

  const [modalVisible, setModalVisible] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

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

  const onOpenModalButtonPress = () => {
    // const allowOpen = checkProductosValues(guia.producto, bancosPulpable);
    const allowOpen = true;
    // setModalVisible(allowOpen);
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
                options={options.tipos}
                defaultOption={options.tipos.find(
                  (option) => option.value === productoForm?.tipo
                )}
                onSelect={(option) => {
                  updateTipo(option?.optionObject!);
                  setRenderKey(renderKey + 1);
                }}
                onRemove={() => {
                  updateTipo(null);
                  setRenderKey(renderKey + 1);
                }}
                key={`tipo-${renderKey}`}
              />
              <Select
                styles={selectStyles}
                placeholderTextColor="#cccccc"
                placeholderText="Seleccione el Producto"
                options={options.productos}
                defaultOption={options.productos.find(
                  (option) => option.value === productoForm.info?.codigo
                )}
                disabled={
                  productoForm.info?.codigo === '' || options.productos.length === 0
                }
                onSelect={(option) => {
                  updateProductoInfo(option);
                  setRenderKey(renderKey + 1);
                }}
                onRemove={() => {
                  updateProductoInfo(null);
                  setRenderKey(renderKey + 1);
                }}
                key={`producto-${renderKey}`}
              />
            </View>
            <Text style={styles.sectionTitle}> Detalle </Text>
            {productoForm.tipo === 'Aserrable' && productoForm.info?.codigo && (
              <View style={[styles.section, { flex: 1 }]}>
                <Aserrable />
              </View>
            )}
            {productoForm.tipo === 'Pulpable' && productoForm.info?.codigo && (
              <View style={[styles.section, { flex: 1 }]}>
                <Pulpable />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        <TouchableOpacity
          style={{
            ...styles.button,
            backgroundColor:
              productoForm.info?.calidad === '' ? 'grey' : colors.secondary,
          }}
          disabled={productoForm.info?.codigo === ''}
          onPress={onOpenModalButtonPress}
        >
          <Text style={styles.buttonText}> Crear Guía Despacho </Text>
        </TouchableOpacity>
      </View>
      <PrecioModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
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
