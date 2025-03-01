# Start client server
# (To use android emulator, after starting the metro server, open the development build manually in the emulator)
.PHONY: start-local-metro
start-local-metro:
	npx expo start --clear

# Start client server offline
.PHONY: start-local-metro-offline
start-local-metro-offline:
	npx expo start --clear --offline

# Update expo branch production (OUT OF DATE)
.PHONY: update-expo-branch
update-expo-branch:
	# First ask the user if they made all the changes to go from dev to production
	@echo "¿Hiciste todas las modificaciones necesarias para pasar de dev a production?"
	@echo "App.tsx: eliminar use emulator"
	@echo "functions/firebase/cloud_functions.ts: ruta a cloud functions prod"
	@echo "screens/emision/createLogic.ts: parseFoliosOptions filtro de guiasSummary"
	@echo "screens/emision/productosLogic.ts: cerrar modal, loading y push a Home"
	@echo "functions/firebase/firestore/guias.ts: createGuiaDoc set(guia) y snapshotPromise(newGuiaDocRef)"
	@read -p "(y/n)" confirm; \
	if [ "$$confirm" != "y" ]; then \
		echo "No se actualizará la rama"; \
		exit 1; \
	fi
	eas update --branch production --message "Update from makefile"

# GENERAL
# Wipe out npm caches and prebuild again
.PHONY: reset-environment-prebuild
reset-environment-prebuild:
	rm -rf node_modules/
	npm cache clean --force
	npm install
	killall Simulator
	rm -rf ~/Library/Developer/Xcode/DerivedData/*
	npx expo prebuild --clean

# Print local folder structure
.PHONY: print-local-folder-structure
print-local-folder-structure:
	ls -R

# IOS
# Select device, install, and run dev build
.PHONY: install-and-run-dev-build-ios
install-and-run-dev-build-ios:
	npx expo run ios --device

# Important reset of ios simulators. Ex: error 115.
.PHONY: kill-simulator-and-delete-derived-data
kill-simulator-and-delete-derived-data:
	killall Simulator
	rm -rf ~/Library/Developer/Xcode/DerivedData/*

# For device testing, it must be signed and uploaded to Testflight (refer to Notion in Mobile App -> Crear Nueva Build)

# ANDROID
# Select device, install, and run dev build
.PHONY: install-and-run-dev-build-android
install-and-run-dev-build-android:
	npx expo run android --device

# Create production-ready app bundle (uploadable to the store)
.PHONY: create-production-app-bundle
create-production-app-bundle:
	eas build --platform android --profile production --local

# Create production-ready apk (shareable with users)
.PHONY: create-production-apk
create-production-apk:
	eas build --platform android --profile production-apk --local

# Create internal-testing apk (shareable with internal testers)
.PHONY: create-staging-internal-apk
create-staging-internal-apk:
	eas build --platform android --profile staging-internal --local
