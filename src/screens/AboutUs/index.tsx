import {ScrollView, View} from 'react-native';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import Card from '../../components/Card';
import InterRegular from '../../components/Text/InterRegular';
import {useEffect, useState} from 'react';
import {getAboutUs} from '../../api/menu';
import Loader from '../../components/Loader';

const AboutUs: React.FC = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    await getAboutUs()
      .then(res => {
        if (res?.data) {
          setData(res?.data?.data?.content);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.container}>
        <InterRegular style={styles.adddetailsheading}>{data}</InterRegular>
      </Card>
    </ScrollView>
  );
};

export default AboutUs;
