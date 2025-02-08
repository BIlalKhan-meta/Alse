import React from 'react';
import { View, StyleSheet } from 'react-native';

const StepIndicator = ({ totalSteps = 3, currentStep = 0 }) => {
  return (
    <View style={styles.container}>
      {[...Array(totalSteps)].map((_, index) => (
        <View key={index} style={styles.stepContainer}>
          <View 
            style={[
              styles.step,
              index === currentStep ? styles.activeStep : styles.inactiveStep
            ]}
          />
          {/* {index < totalSteps - 1 && (
            <View 
              style={[
                styles.connector,
                index === currentStep ? styles.activeConnector : styles.inactiveConnector
              ]}
            />
          )} */}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 5
  },
  activeStep: {
    backgroundColor: '#00A6A6',
  },
  inactiveStep: {
    backgroundColor: '#E5E5E5',
  },
  connector: {
    width: 40,
    height: 4,
  },
  activeConnector: {
    backgroundColor: '#00A6A6',
  },
  inactiveConnector: {
    backgroundColor: '#E5E5E5',
  }
});

export default StepIndicator;
