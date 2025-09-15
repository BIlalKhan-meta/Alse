import React from 'react';
import {View} from 'react-native';
import InterBoldAverage from '../Text/InterBoldAverage';
import InterMedium from '../Text/InterMedium';
import InterRegular from '../Text/InterRegular';
import styles from './styles';
import Row from '../Row';
import {dateHelper} from '../../utils';

interface InfoSectionProps {
  title: string;
  data: {heading: string; label: string[]}[];
  order: any;
}

const InfoSection: React.FC<InfoSectionProps> = ({title, data, order}) => {
  console.log(`InfoSection ${title} - Data:`, data);
  console.log(`InfoSection ${title} - Order:`, order);

  return (
    <View style={styles.container}>
      <InterBoldAverage style={styles.title}>{title}</InterBoldAverage>
      {data.map((item, index) => {
        console.log(`Processing item ${index}:`, item);

        return (
          <View key={index} style={styles.row}>
            <InterMedium style={styles.heading}>{item.heading}</InterMedium>
            <Row>
              {(() => {
                // Handle nested object properties like 'user.first_name'
                const getNestedValue = (obj: any, path: string) => {
                  if (path.includes('.')) {
                    return path
                      .split('.')
                      .reduce((current, key) => current?.[key], obj);
                  } else {
                    return obj?.[path];
                  }
                };

                // Format date fields
                const formatValue = (val: any, fieldName: string) => {
                  if (!val) {
                    return 'N/A';
                  }

                  // Check if it's a date field
                  if (
                    fieldName.includes('_at') ||
                    fieldName.includes('created_at') ||
                    fieldName.includes('updated_at')
                  ) {
                    return dateHelper(val);
                  }

                  // Check if it's a currency field
                  if (
                    fieldName.includes('amount') ||
                    fieldName.includes('charges') ||
                    fieldName.includes('paid_amount')
                  ) {
                    return `$${val}`;
                  }

                  return val;
                };

                // Combine all label values into a single display value
                const combinedValues = item?.label
                  ?.map(value => {
                    const displayValue = getNestedValue(order, value);
                    console.log(`Field: ${value}, Value: ${displayValue}`);
                    return formatValue(displayValue, value);
                  })
                  .filter(val => val !== 'N/A')
                  .join(' ');

                console.log(
                  `Combined values for ${item.heading}:`,
                  combinedValues,
                );

                return (
                  <InterRegular style={styles.value}>
                    {combinedValues || 'N/A'}
                  </InterRegular>
                );
              })()}
            </Row>
          </View>
        );
      })}
    </View>
  );
};

export default InfoSection;
