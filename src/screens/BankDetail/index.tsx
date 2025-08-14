import {useEffect, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {getBank} from '../../api/menu';
import Loader from '../../components/Loader';
import {ViewBank} from './viewBank';
import {UpdateBank} from './updateBank';

const BankDetail: React.FC = () => {
  const route: any = useRoute();
  const [data, setData] = useState();
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  // Get store data from navigation params if coming from AddStore
  const storeData = route?.params?.storeData;
  const isNewStore = route?.params?.isNewStore;

  const getData = async () => {
    setLoading(true);
    await getBank()
      .then(res => {
        if (res?.data?.data) {
          console.log('RESSSSSSSSSSSSSS', res?.data?.data);
          setData(res?.data?.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (data && !visible) {
      setVisible(true);
    }
  }, [data]);

  useEffect(() => {
    // Only fetch bank data if not coming from AddStore flow
    if (!isNewStore) {
      getData();
    }
  }, [isNewStore]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {data && visible && !isNewStore ? (
        <ViewBank data={data} setVisible={setVisible} />
      ) : (
        <UpdateBank
          data={data}
          setData={setData}
          storeData={storeData}
          isNewStore={isNewStore}
        />
      )}
    </>
  );
};

export default BankDetail;
