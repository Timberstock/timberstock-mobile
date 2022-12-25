import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import colors from '../resources/Colors';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/AntDesign';
import { GuiaDespachoProps } from '../interfaces/guias';
import { createGuia } from '../functions/firebase';

export default function CreateGuia(props: any) {
  const { GlobalState } = props;
  const { guias, setGuias, rutEmpresa } = GlobalState;
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);

  const handleCreateGuia = () => {
    const guiaDummy: GuiaDespachoProps = {
      estado: 'emitida',
      fecha: new Date(),
      folio: 1,
      monto: 2046414,
      receptor: {
        razon_social: 'COLLOTYPE LABELS CHILE SA',
        rut: '99563940-8',
      },
    };
    console.log(guias.length);
    guiaDummy.folio = guias[0].folio + 1;
    guiaDummy.monto = guias[0].monto + 131;
    const guiasCopy = [...guias];
    guiasCopy.unshift(guiaDummy);
    setGuias(guiasCopy);
    createGuia(rutEmpresa, guiaDummy);
  };

  const handleOpenDatePicker = () => {
    !date ? setDate(new Date()) : setOpen(true);
  };

  return (
    <View style={styles.screen}>
      <Header screenName="CreateGuia" {...props} />
      <View style={styles.body}>
        <View style={styles.row}>
          <TouchableOpacity onPress={handleOpenDatePicker}>
            <View style={styles.input}>
              <TextInput placeholder={'Fecha y hora'} />
              <Icon name="calendar" size={16} />
            </View>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={open}
            mode="datetime"
            onConfirm={(date) => {
              setOpen(false);
              setDate(date);
            }}
            onCancel={() => setOpen(false)}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleCreateGuia}>
          <Text style={styles.buttonText}> Emitir Guía de Despacho </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 9,
    width: '100%',
    backgroundColor: colors.white,
    justifyContent: 'flex-start',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#cccccc',
    padding: 7,
    fontSize: 14,
    borderRadius: 13,
    textShadow: '0 0px 0px rgba(42,42,42,.75)',
    fontWeight: 'normal',
    fontStyle: 'none',
    textAlign: 'left',
    borderStyle: 'solid',
    boxShadow: '0px 0px 0px 0px rgba(42,42,42,.26)',
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 15,
    margin: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
  },
});
