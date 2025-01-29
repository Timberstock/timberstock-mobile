# Start client server
# (To use android emulator, after starting the metro server, open the development build manually in the emulator)
.PHONY: start-local-metro
start-local-metro:
	npx expo start --dev-client -c

# Start client server offline
.PHONY: start-local-metro-offline
start-local-metro-offline:
	npx expo start --dev-client -c --offline

# Update expo branch production
.PHONY: update-expo-branch
update-expo-branch:
# First ask the user if they made all the changes to go from dev to production
	@echo "¿Hiciste todas las modificaciones necesarias para pasar de dev a production?"
	@echo "App.tsx: eliminar use emulator"
	@echo "functions/firebase/cloud_functions.ts: ruta a cloud functions prod"
	@echo "screens/emision/createLogic.ts: parseFoliosOptions filtro de guiasSummary"
	@echo "screens/emision/productosLogic.ts: cerrar modal, loading y push a Home"
	@echo "functions/firebase/firestore/guias.ts: createGuiaDoc set(guia) y snapshotPromise(newGuiaDocRef)"
	@read -p "(y/n)" confirm
	@if [ "$confirm" != "y" ]; then
		@echo "No se actualizará la rama"
		@exit 1
	@fi
	eas update --branch production --message "Update from makefile"


# Reset node_modules
.PHONY: reset-node_modules
reset-node_modules:
	rm -rf node_modules/ && npm cache clean --force && npm install


# BUILDS FOR LOCAL DEVELOPMENT

# TO MAKE A NEW BUILD FOR LOCAL DEVELOPMENT, FIRST PREBUILD, THEN A MESSAGE TO THE USER TELLING
# TO MAKE CHANGES TO THE PODFILE TO FIX THE BORINGSSL-GRPC ISSUE
.PHONY: prebuild
prebuild:
	npx expo prebuild --clean
	@echo "AFTER PREBUILDING, REMEMBER TO CHANGE THE PODFILE BEFORE BUILDING FOR IOS (Podfile_fix_49_0_23 for SDK 49.0.23)"

# Add this to before the command to wipe out the caches
# killall Simulator
# rm -rf ~/Library/Developer/Xcode/DerivedData/*
.PHONY: reset-ios-build
reset-ios-build:
	rm -rf node_modules/
	npm install
	npx expo prebuild --clean
	npx expo run ios

# IOS
# Build for iOS simulator and run the metro server
.PHONY: ios-build-local-and-run-metro
ios-build-local-and-run-metro:
	@echo "REMEMBER TO CHANGE THE PODFILE BEFORE BUILDING FOR IOS (Podfile_fix_49_0_23 for SDK 49.0.23)"
	cd ios && rm -rf build/ && rm -rf Pods/ && rm Podfile.lock && pod cache clean --all && pod deintegrate && pod setup && pod install && cd .. && npx expo run:ios

# If error 115 when running for ios, run this command and retry:
.PHONY: kill-simulator-and-delete-derived-data
kill-simulator-and-delete-derived-data:
	killall Simulator
	rm -rf ~/Library/Developer/Xcode/DerivedData/*


# Build for android emulator and run the metro server
.PHONY: android-build-local-and-run-metro
android-build-local-and-run-metro:
	npx expo run:android


# Print local folder structure
.PHONY: print-local-folder-structure
print-local-folder-structure:
	ls -R
