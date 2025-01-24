import {
  check,
  request,
  RESULTS,
  requestMultiple,
} from 'react-native-permissions';
import ReactNativeToastMessage from 'react-native-toast-message';

// This function can be used anywhere as it supports multiple permissions.
// It checks for permissions and then requests for it.
export async function checkMultiplePermissions(permissions) {
  let isPermissionGranted = false;
  let returnData = [];
  const statuses = await requestMultiple(permissions);
  for (var index in permissions) {
    if (statuses[permissions[index]] === RESULTS.GRANTED) {
      isPermissionGranted = true;
      returnData.push({
        isPermissionGranted: isPermissionGranted,
        message: permissions[index],
      });
    } else {
      isPermissionGranted = false;
      returnData.push({
        isPermissionGranted: isPermissionGranted,
        message: permissions[index],
      });
      break;
    }
  }
  return returnData;
}

// In case you want to check a single permission
export async function checkPermission(permission) {
  var isPermissionGranted = false;
  const result = await check(permission);
  switch (result) {
    case RESULTS.GRANTED:
      isPermissionGranted = true;
      break;
    case RESULTS.DENIED:
      isPermissionGranted = false;
      break;
    case RESULTS.BLOCKED:
      isPermissionGranted = false;
      break;
    case RESULTS.UNAVAILABLE:
      isPermissionGranted = false;
      break;
  }
  return isPermissionGranted;
}

type Message = string | object;

function ToastMessage() {
  this.success = (message: string): void => {
    if (typeof message !== 'string') {
      message = 'An error occurred. Please try again later';
    }

    ReactNativeToastMessage.show({
      type: 'success',
      position: 'top',
      text1: 'Success',
      text2: message,
      props: {
        style: {
          backgroundColor: 'green',
        },
      },
    });
  };

  this.error = (message: string): void => {
    if (typeof message !== 'string') {
      message = 'An error occurred. Please try again later';
    }

    ReactNativeToastMessage.show({
      type: 'error',
      position: 'top',
      text1: 'Error',
      text2: message,
      props: {
        style: {
          backgroundColor: 'red',
        },
      },
    });
  };
}

export const Toast = new ToastMessage();

export const showToast = (msg: Message): void => {
  presentToast(getMessage(msg));
};

export const presentToast = (message: string): void => {
  setTimeout(() => {
    Toast.error(message);
  }, 500);
};

export const getMessage = (json: Message): string => {
  switch (typeof json) {
    case 'string': {
      return json;
    }
    case 'object': {
      if (Array.isArray(json)) {
        const data = json[0];
        return getMessage(data);
      } else {
        if (json && 'errors' in json) {
          const data = json.errors;
          if (typeof data === 'object') {
            const values = Object.values(data);
            return getMessage(values);
          } else {
            return getMessage(data);
          }
        } else {
          if (
            json &&
            ('validation_error' in json ||
              typeof json.message === 'object' ||
              json.msg ||
              json.message)
          ) {
            if (json.validation_error) {
              const errorKeys = Object.keys(json.validation_error);
              return getMessage(json.validation_error[errorKeys[0]][0]);
            }
            if (json.message) {
              return getMessage(json.message);
            }
            if (json.msg) {
              return getMessage(json.msg);
            } else {
              const errorKeys = Object.keys(json.message);
              return getMessage(json.message[errorKeys[0]][0]);
            }
          }
          if (json.message) {
            return getMessage(json.message);
          } else if (json.error) {
            return getMessage(json.error);
          } else {
            return 'An error occurred. Please try again later';
          }
        }
      }
    }
    default: {
      return 'An error occurred. Please try again later';
    }
  }
};
