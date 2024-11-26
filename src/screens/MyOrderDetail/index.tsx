import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, FlatList} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import CartItem from '../../components/CartItem';
import styles from './styles';
import Summary from '../../components/SummaryComponent';
import StatusBadge from '../../components/StatusBadge';
import InfoSection from '../../components/InfoSection';
import Card from '../../components/Card';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import {images} from '../../utils/images';
import GeneralModal from '../../components/GeneralModal';
import {products} from '../../dummyData';
import InterMedium from '../../components/Text/InterMedium';
import {getOrderDetail, AcceptOrder, RejectOrder, DeliverOrder} from '../../api/product';
import Loader from '../../components/Loader';
import {dateHelper} from '../../utils';
import CustomButton from '../../components/CustomButton';
import Toast from 'react-native-toast-message';
import InterBoldAverage from '../../components/Text/InterBoldAverage';
import InterRegular from '../../components/Text/InterRegular';

const contactInfo = [
  {heading: 'Username', label: 'first_name'},
  {heading: 'Phone Number', label: 'phone'},
  {heading: 'Email', label: 'email'},
];

const shippingAddress = [
  {heading: 'Customer Name', label: 'shipping_first_name'},
  {heading: 'Phone Number', label: 'shipping_phone'},
  {heading: 'Address', label: 'shipping_address'},
  {heading: 'Country', label: 'shipping_country'},
  {heading: 'State', label: 'shipping_state'},
  {heading: 'City', label: 'shipping_city'},
  {heading: 'Zip Code', label: 'shipping_zip'},
];

const billingAddress = [
  {heading: 'Customer Name', label: 'billing_first_name'},
  {heading: 'Phone Number', label: 'billing_phone'},
  {heading: 'Address', label: 'billing_address'},
  {heading: 'Country', label: 'billing_country'},
  {heading: 'State', label: 'billing_state'},
  {heading: 'City', label: 'billing_city'},
  {heading: 'Zip Code', label: 'billing_zip'},
];

const MyOrderDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  console.log('route?.paramsroute?.params ===>',route?.params?.StoreOrder);
  
  const id = route?.params?.id;
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportInput, setReportInput] = useState(false);
  const [ReportSuccess, setReportSuccess] = useState(false);
  const [data, setData] = useState();
  const [loader, setLoader] = useState(false);
  const [rejectionReason, setRejectionReason]=useState('')
  const [cancelLoader, setCancelLoader]= useState(false)
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Order Detail',
    });
  }, [navigation]);
console.log("rejectionReasonrejectionReadsfsdson ===>",rejectionReason);

  const getData = async () => {
    setLoader(true);
    await getOrderDetail(id)
      .then(res => {
        console.log("res ===>",res?.data);
        
        if (res?.data) {
          setData(res?.data?.data);
        }
      })
      .catch(err => {
        console.log('ERRORRRRRRRRR', err);
      })
      .finally(() => {
        setLoader(false);
      });
  };
  const OrderAccept = () =>{
      AcceptOrder(id).then(res =>{
        console.log("Response from Accept Order =====>",res);
    setOrderSuccess(true);
        
      }).catch(err =>{
        console.log("Accept Order Error ===>", err);
        
      })
  
    

  }

  const Deliver = () =>{
    DeliverOrder(id).then(res =>{
      console.log("Response from Accept Order =====>",res?.data?.message);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: res?.data?.message,
      });
      navigation.goBack()
  // setOrderSuccess(true);
      
    }).catch(err =>{
      console.log("Accept Order Error ===>", err);
      
    })
  }
  const cancelOrder = () =>{
    const data ={
      reason:rejectionReason
    }
    if(rejectionReason){
    setCancelLoader(true)

RejectOrder(data, id).then(res =>{
// setOrderSuccess(true);
setReportInput(false);
setReportSuccess(true);
    setCancelLoader(false)
               
  
}).catch(err =>{
  console.log("Reject Order Error ===>", err);
  setCancelLoader(false)
  
})
}else{
  Toast.show({
    type: 'error',
    text1: 'Upload Media',
    text2: 'Please Enter Rejection Reason',
  });
}
}

 
  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id]);

  // if (loader) {
  //   return <Loader />;
  // }

  return (
    <View style={styles.container}>
      <FlatList
        refreshing={loader}
        onRefresh={getData}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => {
          return (
            <View style={styles.orderInfo}>
              <View>
                <InterMedium style={styles.orderId}>
                  Order Id: {data?.id}
                </InterMedium>
                <InterMedium style={styles.orderDate}>
                  Order Date: {dateHelper(data?.created_at)}
                </InterMedium>
                {/* {status == 'Delivered' && (
              <InterMedium style={styles.orderDate}>
                Delivered Date: 01/01/2024
              </InterMedium>
            )} */}
              </View>

              <View>
                <StatusBadge status={data?.status} />
              </View>
            </View>
          );
        }}
        data={data?.order_details}
        renderItem={({item, index}) => {
          console.log("Item from renderItem ========>",item)
          return (
          <CartItem
            item={item}
            showQuantityControls={false}
            showSeparator={index !== products.length - 1}
            showDelete={false}
            status={data?.status}
          />
        )}}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={() => {
          return (
            <View style={styles.summaryContainer}>
              <Summary
                subTotal={data?.total_amount}
                deliveryCharges={data?.delivery_charges}
                style={{marginHorizontal: 2}}
                titleStyle={styles.titleStyle}
              />

              {data && (
                <Card>
                  <InfoSection
                    title="Contact Information"
                    data={contactInfo}
                    order={data}
                  />
                  <HorizontalSeparator />
                  <InfoSection
                    title="Shipping Address"
                    data={shippingAddress}
                    order={data}
                  />
                  <HorizontalSeparator />

                  <InfoSection
                    title="Billing Address"
                    data={billingAddress}
                    order={data}
                  />
                </Card>
              )}

              {data?.status === 'cancelled' && (
            <>
              <InterBoldAverage style={styles.rejectHeading}>
                Cancellation Reason
              </InterBoldAverage>
              {console.log("Dat =======>",data?.reason)}
              <InterRegular style={styles.rejectValue}>
                {data?.reason}
              </InterRegular>
            </>
          )}

              {route?.params?.StoreOrder && (
            <View style={styles.btnConatiner}>
               
               {data?.status == 'pending' && <>
              
              <CustomButton
                style={styles.acceptBtn}
                onPress={OrderAccept}>
                Accept
              </CustomButton>

              <CustomButton
                style={styles.rejectBtn}
                txtstyle={styles.btntxtstyle}
                onPress={() => {
                  setReportVisible(true);
                }}>
                Rejected
              </CustomButton>
              </>}
            {data?.status == 'accepted' &&(
              <View style={{width:'100%'}}>
              <CustomButton
          style={styles.acceptBtn}
          
                onPress={Deliver}>
                Mark As Delivered
              </CustomButton>
              </View>)}
               
            </View>
          )}

              
            </View>
          );
        }}
      />
      <GeneralModal
                visible={orderSuccess}
                closeModal={() => setOrderSuccess(false)}
                icon={images.doubleCheck}
                title={'Accept Order'}
                message="Order has been Accepted"
                buttonText="Ok"
                primaryBtn={true}
                onPress={() => {
                  setOrderSuccess(false);
                  navigation.goBack()
                }}
              />

              <GeneralModal
                visible={reportVisible}
                closeModal={() => setReportVisible(false)}
                icon={images.qmark}
                title="Reject Order"
                message="Are you sure you want to reject this Order?"
               
                SecondaryText1={'Yes'}
                SecondaryText2="No"
                secondaryBtn={true}
                onPress={() => {
                  setReportVisible(false)
                  setReportInput(true) 
                  }
                
                }
                smallButtons={true}
              />
              <GeneralModal
                visible={reportInput}
                closeModal={() => setReportInput(false)}
                // icon={images.doubleCheck}
                title="Reason Of Reject Order"
                // message='Post has been delete successfully.'
                buttonText="Ok"
                inputVisible={true}
                onPress={cancelOrder}
                loading={cancelLoader}
                setRejectionReason={setRejectionReason}
                rejectionReason={rejectionReason}
                primaryBtn={true}
              />

              <GeneralModal
                visible={ReportSuccess}
                closeModal={() => setReportSuccess(false)}
                icon={images.doubleCheck}
                title="Reject Order"
                message="Order has been rejected successfully."
                buttonText="Ok"
                primaryBtn={true}
                onPress={() => {
                  setReportSuccess(false);
                  navigation.goBack()
                }}
              />
    </View>
  );
};

export default MyOrderDetail;
