import {useEffect, useState} from 'react';
import {getBank} from '../../api/menu';
import Loader from '../../components/Loader';
import {ViewBank} from './viewBank';
import {UpdateBank} from './updateBank';

const BankDetail: React.FC = () => {
  const [data, setData] = useState();
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

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
    getData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {data && visible ? (
        <ViewBank data={data} setVisible={setVisible} />
      ) : (
        <UpdateBank data={data} setData={setData} />
      )}
    </>
  );
};

export default BankDetail;
