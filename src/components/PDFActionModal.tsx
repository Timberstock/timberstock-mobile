import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import colors from "@/resources/Colors";

interface PDFActionModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
  webUrl?: string;
}

export default function PDFActionModal({
  visible,
  onClose,
  onShare,
  webUrl,
}: PDFActionModalProps) {
  const handleWebView = () => {
    if (webUrl) {
      Linking.openURL(webUrl);
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Opciones PDF</Text>

          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Icon name="share-alt" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>
              Compartir/Mover PDF Local
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !webUrl && styles.disabledButton]}
            onPress={handleWebView}
            disabled={!webUrl}
          >
            <Icon name="external-link" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Ver PDF Web</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: colors.white,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: colors.lightGrayButton,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    color: colors.darkGray,
    fontSize: 16,
  },
});
