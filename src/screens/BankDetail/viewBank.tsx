import React from 'react';
import {View} from 'react-native';
import Card from '../../components/Card';
import InterMedium from '../../components/Text/InterMedium';
import styles from './styles';
import CustomButton from '../../components/CustomButton';

export const ViewBank = ({data, setVisible}) => {
  return (
    <View style={styles.container}>
      <Card style={styles.contentContainer}>
        <View style={styles.txtConatiner}>
          <InterMedium style={styles.txt}>Account Holder Name</InterMedium>
          <InterMedium style={styles.phoneTxt}>
            {data?.account_name}
          </InterMedium>
        </View>

        <View style={styles.txtConatiner}>
          <InterMedium style={styles.txt}>Account Type</InterMedium>
          <InterMedium style={styles.phoneTxt}>
            {data?.account_type}
          </InterMedium>
        </View>

        <View style={styles.txtConatiner}>
          <InterMedium style={styles.txt}>Bank Name</InterMedium>
          <InterMedium style={styles.phoneTxt}>{data?.bank_name}</InterMedium>
        </View>

        <View style={styles.txtConatiner}>
          <InterMedium style={styles.txt}>Routing Number</InterMedium>
          <InterMedium style={styles.phoneTxt}>
            {data?.routing_number}
          </InterMedium>
        </View>

        <View style={styles.txtConatiner}>
          <InterMedium style={styles.txt}>Account Number</InterMedium>
          <InterMedium style={styles.phoneTxt}>
            {data?.account_number}
          </InterMedium>
        </View>

        <CustomButton
          style={styles.btnConatiner}
          onPress={() => setVisible(false)}>
          Edit Details
        </CustomButton>
      </Card>
    </View>
  );
};
