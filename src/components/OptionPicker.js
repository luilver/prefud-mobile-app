import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, text, radius, makeStyles } from '../theme';

export function OptionPicker({
  value,
  options,
  onValueChange,
  disabled = false,
  placeholder = 'Seleccionar',
  style,
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => String(o.value) === String(value));

  const handleSelect = (option) => {
    setOpen(false);
    onValueChange(option.value);
  };

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setOpen((prev) => !prev)}
        disabled={disabled}
      >
        <Text style={styles.label}>{selected?.label || placeholder}</Text>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.list}>
          {options.map((option) => (
            <TouchableOpacity
              key={String(option.value)}
              style={[
                styles.item,
                String(option.value) === String(value) && styles.itemSelected,
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text style={styles.itemText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = makeStyles({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  label: {
    ...text.body,
    fontSize: 13,
    color: colors.onBackground,
    flexShrink: 1,
  },
  chevron: {
    fontSize: 12,
    color: colors.muted,
    marginLeft: 6,
  },
  list: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginTop: 4,
    maxHeight: 220,
    overflow: 'hidden',
    zIndex: 10,
  },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemSelected: {
    backgroundColor: '#EFF6F2',
  },
  itemText: {
    ...text.body,
    fontSize: 13,
    color: colors.onBackground,
  },
});
