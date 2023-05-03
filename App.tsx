import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import Crashes from 'appcenter-crashes';
import Analytics from 'appcenter-analytics';

import { Colors } from 'react-native/Libraries/NewAppScreen';

export const App = (): JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const [amount, setAmount] = useState<number>(0);
  const [inflationRate, setInflationRate] = useState<number>(0);
  const [timeInYears, setTimeInYears] = useState<number>(0);
  const [riskFreeRate, setRiskFreeRate] = useState<number>(0);
  const [afterInflation, setAfterInflation] = useState<number>(0);
  const [atRiskFree, setAtRiskFree] = useState<number>(0);
  const [atRiskFreeAfterInflation, setAtRiskFreeAfterInflation] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    checkPreviousSession();
  }, []);

  const checkPreviousSession = async () => {
    const didCrash = await Crashes.hasCrashedInLastSession();
    if (didCrash) {
      const report = await Crashes.lastSessionCrashReport();
      Alert.alert('Sorry about the crash!');
      console.log('Report', report);
    }
  };

  const calculateInflationImpact = (value: number, inflationRate: number, time: number) => {
    return value / Math.pow(1 + inflationRate, time);
  };

  const calculate = () => {
    const newAfterInflation = calculateInflationImpact(amount, inflationRate / 100, timeInYears);
    const newAtRiskFree = amount * Math.pow(1 + riskFreeRate / 100, timeInYears);

    const newAtRiskFreeAfterInflation = calculateInflationImpact(
      newAtRiskFree,
      inflationRate / 100,
      timeInYears
    );

    const newDifference = newAtRiskFreeAfterInflation - newAfterInflation;

    setAfterInflation(newAfterInflation);
    setAtRiskFree(newAtRiskFree);
    setAtRiskFreeAfterInflation(newAtRiskFreeAfterInflation);
    setDifference(newDifference);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <View style={styles.container}>
          <TextInput
            placeholder="Current inflation rate"
            style={styles.textBox}
            keyboardType="decimal-pad"
            onChangeText={(inflationRate) => setInflationRate(parseFloat(inflationRate))}
          />
          <TextInput
            placeholder="Current risk free rate"
            style={styles.textBox}
            keyboardType="decimal-pad"
            onChangeText={(riskFreeRate) => setRiskFreeRate(parseFloat(riskFreeRate))}
          />
          <TextInput
            placeholder="Amount you want to save"
            style={styles.textBox}
            keyboardType="decimal-pad"
            onChangeText={(amount) => setAmount(parseFloat(amount))}
          />
          <TextInput
            placeholder="For how long (in years) will you save?"
            style={styles.textBox}
            keyboardType="decimal-pad"
            onChangeText={(timeInYears) => setTimeInYears(parseFloat(timeInYears))}
          />
          <Button
            title="Calculate inflation"
            onPress={() => {
              calculate();
              Analytics.trackEvent('calculate_inflation', { Internet: 'WiFi', GPS: 'Off' });
            }}
          />
          <Text style={styles.label}>
            {timeInYears} years from now you will still have ${amount} but it will only be worth $
            {afterInflation}.
          </Text>
          <Text style={styles.label}>
            But if you invest it at a risk free rate you will have ${atRiskFree}.
          </Text>
          <Text style={styles.label}>
            Which will be worth ${atRiskFreeAfterInflation} after inflation.
          </Text>
          <Text style={styles.label}>A difference of: ${difference}.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginHorizontal: 16,
  },
  label: {
    marginTop: 10,
  },
  textBox: {
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});
