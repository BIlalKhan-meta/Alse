import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import InterBoldAverage from '../Text/InterBoldAverage';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import styles from './styles';
import Row from '../Row';

interface InfoSectionProps {
  title: string;
  data: {heading: string; label: string[]}[];
  order: any;
}

const InfoSection: React.FC<InfoSectionProps> = ({title, data, order}) => {
  return (
    <View style={styles.container}>
      <InterBoldAverage style={styles.title}>{title}</InterBoldAverage>
      {data.map((item, index) => (
        <View key={index} style={styles.row}>
          <InterMedium style={styles.heading}>{item.heading}</InterMedium>
          <Row>
            {item?.label?.map(value => {
              return (
                <InterRegular style={styles.value}>{order[value]}</InterRegular>
              );
            })}
          </Row>
        </View>
      ))}
    </View>
  );
};

export default InfoSection;
