import PDFActionModal from '@/components/PDFActionModal';
import { AppContext } from '@/context/AppContext';
import { UserContext } from '@/context/UserContext';
import { fetchGuiasDocs } from '@/functions/firebase/firestore/guias';
import { GuiaDespachoSummaryProps } from '@/interfaces/screens/home';
import colors from '@/resources/Colors';
import firebase from '@react-native-firebase/app';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function GuiasHome(props: any) {
  const { user, updateUserAuth } = useContext(UserContext);
  const router = useRouter();
  const { guiasSummary, updateGuiasSummary, handleUpdateAvailable } =
    useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const directorySetupDone = useRef(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    // If already done or user is not logged in, skip
    if (directorySetupDone.current || !user || !user.empresa_id || !user.firebaseAuth)
      return;

    const directoriesAndLogo = async () => {
      console.log('Reading app folder content...');

      const appFolderContent = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory as string
      );

      console.log('App folder found:', appFolderContent);

      if (appFolderContent.includes(user?.empresa_id)) {
        console.log('Empresa folder found');
      } else {
        console.log('Empresa folder not found, creating...');
        const empresaFolder = FileSystem.documentDirectory + user?.empresa_id;
        await FileSystem.makeDirectoryAsync(empresaFolder);
        console.log('Empresa folder created');
      }

      const empresaFolderContent = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory + user?.empresa_id
      );

      console.log('Empresa folder content:', empresaFolderContent);

      if (empresaFolderContent.includes('logo.png')) {
        console.log('Logo found');
      } else {
        try {
          console.log('Logo not found, continuing without logo');

          // console.log("Firebase storage through firebase app: ");
          // console.log(firebase.storage);
          // console.log("Firebase storage through storage: ");
          // console.log(storage);
          // const storageInstance = firebase.app().storage();

          // // Get the download URL from Firebase Storage
          // const logoUrl = await storageInstance
          //   .ref(`empresas/${user?.empresa_id}/logo.png`)
          //   .getDownloadURL();

          // // Download the file using Expo FileSystem
          // const fileUri = `${FileSystem.documentDirectory}${user?.empresa_id}/logo.png`;
          // const downloadResult = await FileSystem.downloadAsync(
          //   logoUrl,
          //   fileUri,
          // );

          // if (downloadResult.status === 200) {
          //   console.log("Logo downloaded successfully");
          // } else {
          //   console.error("Failed to download logo:", downloadResult);
          // }
        } catch (error) {
          console.error('Error downloading logo:', error);
        }
      }
    };

    directoriesAndLogo();
    directorySetupDone.current = true;
  }, [user]); // Will only run once when user is available

  const handleRefresh = async () => {
    if (user?.empresa_id) {
      try {
        const empresaGuias = await fetchGuiasDocs(user.empresa_id);
        updateGuiasSummary(empresaGuias);
        updateUserAuth(user.firebaseAuth);
        setLoading(false);
      } catch (error) {
        Alert.alert(
          'Error al cargar guías',
          'No se pudo obtener la información de la empresa'
        );
      }
    } else {
      Alert.alert('Error', 'Error al cargar empresa_id del usuario');
    }
  };

  const handleCreateGuia = () => {
    if (user?.folios_reservados.length === 0 || !user?.folios_reservados) {
      Alert.alert('Error', 'No tienes folios reservados');
    } else {
      router.push('/(tabs)/(guia-creation-stack)/datos-guia');
    }
  };

  const renderGuiaItem = useCallback(
    ({ item }: { item: GuiaDespachoSummaryProps }) => {
      return <GuiaDespachoCardItem item={item} user={user} />;
    },
    [user]
  );

  const keyExtractor = useCallback((item: GuiaDespachoSummaryProps) => {
    if (!item.id) {
      console.warn('Missing id for item:', item);
      // Fallback to composite key if id is missing
      return `${item.folio}-${item.fecha}-${item.receptor.rut}`;
    }
    return item.id;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} />
        ) : (
          <FlatList
            data={guiasSummary}
            renderItem={renderGuiaItem}
            onRefresh={handleRefresh}
            refreshing={loading}
            keyExtractor={keyExtractor}
          />
        )}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              user?.folios_reservados.length === 0 && styles.disabledButton,
            ]}
            onPress={handleCreateGuia}
          >
            <Text
              style={[
                styles.buttonText,
                user?.folios_reservados.length === 0 && styles.disabledButtonText,
              ]}
            >
              Crear Nueva Guía
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  body: {
    flex: 9,
    padding: 15,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 7,
  },
  icon: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardText: {
    fontSize: 14,
    color: colors.darkGray,
    marginVertical: 2,
  },
  buttonsContainer: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
    position: 'absolute',
    bottom: 25,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.lightGrayButton, // Set a lighter color or gray tone for disabled state
    borderColor: colors.darkGrayButton, // Optional border color for contrast
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: colors.gray, // Use a lighter text color to indicate it's disabled
  },
});

const GuiaDespachoCardItem = React.memo(
  ({
    item,
    user,
  }: {
    item: GuiaDespachoSummaryProps;
    user: any; // Replace 'any' with your user type
  }) => {
    const [pdfModalVisible, setPdfModalVisible] = useState(false);

    const handleSharePDF = async () => {
      try {
        const pdfPathOpt1 = `${FileSystem.documentDirectory}${user?.empresa_id}/GD_${item.folio}.pdf`;
        const pdfPathOpt2 = `${FileSystem.documentDirectory}${user?.empresa_id}/GuiaFolio${item.folio}.pdf`;
        const fileInfoOpt1 = await FileSystem.getInfoAsync(pdfPathOpt1);
        const fileInfoOpt2 = await FileSystem.getInfoAsync(pdfPathOpt2);

        if (fileInfoOpt1.exists) {
          await shareAsync(pdfPathOpt1, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
          });
        } else if (fileInfoOpt2.exists) {
          await shareAsync(pdfPathOpt2, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
          });
        } else {
          Alert.alert(
            'PDF no encontrado',
            'No se encontró el PDF local para esta guía'
          );
        }
      } catch (error) {
        console.error('Error sharing PDF:', error);
        Alert.alert('Error', 'No se pudo compartir el PDF');
      }
      setPdfModalVisible(false);
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Folio: {item.folio}</Text>
          <Icon
            name="file-pdf-o"
            style={styles.icon}
            size={30}
            color={colors.accent}
            onPress={() => setPdfModalVisible(true)}
          />
        </View>
        <Text style={styles.cardText}>Fecha: {item.fecha}</Text>
        <Text style={styles.cardText}>Estado: {item.estado}</Text>
        <Text style={styles.cardText}>Receptor: {item.receptor.razon_social}</Text>
        <Text style={styles.cardText}>Monto: {item.monto_total_guia}</Text>

        <PDFActionModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          onShare={handleSharePDF}
          webUrl={item.pdf_url}
        />
      </View>
    );
  }
);
