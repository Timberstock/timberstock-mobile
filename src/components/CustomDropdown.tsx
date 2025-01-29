import { theme } from '@/theme';
import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Animated, {
  Easing,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

interface CustomDropdownProps<T> {
  // Value to compare the selected item with the options data (number in case of folio)
  value: number | string | null;
  // Field to use to display items in the dropdown (field from selected and data)
  labelField: string;
  // Field to use the value in 'value' to compare the selected item with the options data
  valueField: string;
  placeholder?: string;
  data: T[]; // Array of whatever type we pass
  disabled?: boolean;
  searchPlaceholder?: string;
  onChange: (item: T) => void; // Now it matches the data type!
  onClear: () => void;
  style?: StyleProp<ViewStyle>;
}

// Define the ref type
type DropdownRef = {
  open: () => void;
  close: () => void;
};

function CustomDropdown<T>({
  placeholder = 'Seleccionar',
  value,
  data,
  labelField,
  valueField,
  searchPlaceholder = 'Buscar...',
  onChange,
  onClear,
  disabled,
  style,
}: CustomDropdownProps<T>) {
  const [isFocus, setIsFocus] = useState(false);
  const dropdownRef = useRef<DropdownRef>(null);

  // Even smoother container animation
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isFocus ? 1.02 : 1, {
          mass: 0.4, // Even lighter for faster response
          damping: 10, // Smooth as butter
          stiffness: 80, // natural feel
        }),
      },
    ],
    backgroundColor: withTiming(
      disabled
        ? theme.colors.surfaceContainerLowest // Darker when disabled
        : isFocus
          ? theme.colors.surfaceContainerHighest
          : theme.colors.surfaceContainer,
      { duration: 200 }
    ),
    opacity: disabled ? 0.6 : 1, // Fade when disabled
  }));

  // Smooth icon rotation
  const iconStyle = useAnimatedStyle(() => {
    const rotate = withTiming(isFocus ? '180deg' : '0deg', {
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design easing
    });

    return {
      transform: [{ rotate }],
    };
  });

  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          dropdownRef.current?.open();
          setIsFocus(true);
        }
      }}
      android_ripple={{
        color: disabled ? 'transparent' : `${theme.colors.primary}20`,
        borderless: false,
        foreground: true,
      }}
      style={({ pressed }) => [
        styles.pressableContainer,
        pressed && !disabled && { opacity: 0.9 },
        disabled && styles.disabledContainer,
      ]}
    >
      <Animated.View style={[containerStyle, styles.container]}>
        <Dropdown
          data={data}
          value={value}
          labelField={labelField}
          valueField={valueField}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            // Remove the index from the item (which is added automatically by the library)
            const { _index, ...rest } = item;

            onChange(rest);
            setIsFocus(false);
          }}
          ref={dropdownRef}
          style={[
            styles.dropdown,
            isFocus && styles.dropdownFocus,
            disabled && styles.dropdownDisabled,
            !value && styles.dropdownEmpty,
            style,
          ]}
          placeholderStyle={[
            styles.placeholderStyle,
            {
              color: disabled
                ? theme.colors.onSurfaceVariant
                : theme.colors.onSurfaceVariant,
            },
            disabled && { opacity: 0.5 },
          ]}
          selectedTextStyle={[
            styles.selectedTextStyle,
            {
              color: disabled ? theme.colors.onSurfaceVariant : theme.colors.onSurface,
            },
          ]}
          inputSearchStyle={[
            styles.inputSearchStyle,
            {
              backgroundColor: theme.colors.surfaceContainerHighest,
              color: theme.colors.onSurface,
            },
          ]}
          iconStyle={styles.iconStyle}
          search
          maxHeight={300}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          dropdownPosition="bottom"
          renderLeftIcon={() => (
            <Animated.View style={iconStyle}>
              <Icon
                name="chevron-down"
                size={20}
                color={disabled ? theme.colors.outline : theme.colors.onSurfaceVariant}
                style={styles.icon}
              />
            </Animated.View>
          )}
          renderRightIcon={() => {
            return value && !disabled ? (
              <TouchableOpacity
                onPress={() => {
                  onClear?.();
                  setIsFocus(false);
                }}
                style={styles.clearButton}
              >
                <Icon name="close-circle" size={25} color={theme.colors.outline} />
              </TouchableOpacity>
            ) : null;
          }}
          activeColor={`${theme.colors.primaryContainer}`}
          containerStyle={styles.listContainer}
          itemContainerStyle={styles.itemContainer}
          itemTextStyle={styles.itemText}
          disable={disabled}
          autoScroll={false}
        />
      </Animated.View>
    </Pressable>
  );
}

function arePropsEqual<T>(
  prevProps: CustomDropdownProps<T>,
  nextProps: CustomDropdownProps<T>
) {
  const isEqual =
    prevProps.value === nextProps.value &&
    prevProps.data === nextProps.data &&
    prevProps.disabled === nextProps.disabled;
  return isEqual;
}

export default React.memo(CustomDropdown, arePropsEqual) as typeof CustomDropdown;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
  },
  dropdown: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 0,
  },
  dropdownFocus: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    shadowOpacity: 0.12,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  clearButton: {
    padding: 0,
    marginRight: 0,
    width: 25,
  },
  placeholderStyle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  inputSearchStyle: {
    height: 48,
    fontSize: 16,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surfaceContainerHighest,
    color: theme.colors.onSurface,
  },
  listContainer: {
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.outlineVariant,
    elevation: 3,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  itemContainer: {
    borderRadius: 8,
  },
  itemText: {
    color: theme.colors.onSurface,
    fontSize: 16,
  },
  pressableContainer: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  dropdownDisabled: {
    borderColor: theme.colors.outlineVariant,
    borderWidth: 1,
    opacity: 0.6,
  },
  dropdownEmpty: {
    borderColor: theme.colors.outline,
    borderWidth: 1,
  },
  disabledContainer: {
    opacity: 0.6,
  },
});
