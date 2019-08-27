package com.mercator.cordova.fcm;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import android.content.Context;
import android.app.Notification;
import android.support.v4.app.NotificationCompat;
import android.app.NotificationManager;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.support.v4.app.NotificationManagerCompat;
import android.util.Log;
import android.provider.Settings;
import android.net.Uri;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.Random;
import android.os.Bundle;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.iid.FirebaseInstanceId;

import java.util.Map;
import java.util.HashMap;

public class FCMPlugin extends CordovaPlugin {
 
	private static final String TAG = "FCMPlugin";
	private static SharedPreference preference;
	public static CordovaWebView gWebView;
	public static CordovaInterface cordovaInterface;
	public static String notificationCallBack = "FCMPlugin.onNotificationReceived";
	public static Boolean notificationCallBackReady = false;
	public static Map<String, Object> lastPush = new HashMap<String,Object>();
	public static JSONObject failedData = new JSONObject();
    public static int intNotificationId = 11111;

    //String [] permissions = { Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION };
	 
	public FCMPlugin() {}
	
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
		gWebView = webView;
		cordovaInterface = cordova;
		Log.d(TAG, "==> FCMPlugin initialize");
		FirebaseMessaging.getInstance().subscribeToTopic("android");
		FirebaseMessaging.getInstance().subscribeToTopic("all");
		preference = SharedPreference.getSharedPreference(cordova.getActivity().getApplicationContext());
	}

	public boolean execute(final String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {

		Log.d(TAG,"==> FCMPlugin execute: "+ action);
		
		try{
			// READY //
			if (action.equals("ready")) {
				//
				callbackContext.success();
			}
			// GET TOKEN //
			else if (action.equals("getToken")) {
				cordova.getActivity().runOnUiThread(new Runnable() {
					public void run() {
						try{
							String token = FirebaseInstanceId.getInstance().getToken();
							callbackContext.success( FirebaseInstanceId.getInstance().getToken() );
							Log.d(TAG,"\tToken: "+ token);
						}catch(Exception e){
							Log.d(TAG,"\tError retrieving token");
						}
					}
				});
			}
			// NOTIFICATION CALLBACK REGISTER //
			else if (action.equals("registerNotification")) {
				notificationCallBackReady = true;
				cordova.getActivity().runOnUiThread(new Runnable() {
					public void run() {
						//if(lastPush != null) FCMPlugin.sendPushPayload( cordova.getActivity().getApplicationContext(), lastPush );
						//lastPush = null;
						callbackContext.success();
					}
				});
			}
			// UN/SUBSCRIBE TOPICS //
			else if (action.equals("subscribeToTopic")) {
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						try{
							FirebaseMessaging.getInstance().subscribeToTopic( args.getString(0) );
							callbackContext.success();
						}catch(Exception e){
							callbackContext.error(e.getMessage());
						}
					}
				});
			}
			else if (action.equals("unsubscribeFromTopic")) {
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						try{
							FirebaseMessaging.getInstance().unsubscribeFromTopic( args.getString(0) );
							callbackContext.success();
						}catch(Exception e){
							callbackContext.error(e.getMessage());
						}
					}
				});
			}
			else if (action.equals("hasPermission")) {
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						try{
							boolean hasPermission = hasPermission(cordova.getActivity().getApplicationContext());
							callbackContext.success(hasPermission ? "Y" : "N");
						}catch(Exception e){
							callbackContext.error(e.getMessage());
						}
					}
				});
			}
			else if (action.equals("openSettings")) {
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						try{
							openSettings(cordova.getActivity().getApplicationContext());
						}catch(Exception e){
							callbackContext.error(e.getMessage());
						}
					}
				});
			}
			else{
				callbackContext.error("Method not found");
				return false;
			}
		}catch(Exception e){
			Log.d(TAG, "ERROR: onPluginAction: " + e.getMessage());
			callbackContext.error(e.getMessage());
			return false;
		}
		
		//cordova.getThreadPool().execute(new Runnable() {
		//	public void run() {
		//	  //
		//	}
		//});
		
		//cordova.getActivity().runOnUiThread(new Runnable() {
        //    public void run() {
        //      //
        //    }
        //});
		return true;
	}
	
	public static void sendPushPayload(Context context,Map<String, Object> payload) {

		String callBack = "";
		preference = SharedPreference.getSharedPreference(context);

	    try {
		    JSONObject jo = new JSONObject();
			for (String key : payload.keySet()) {
			    jo.put(key, payload.get(key));
				//Log.d(TAG, "\tpayload: " + key + " => " + payload.get(key));
            }


			if(notificationCallBackReady && gWebView != null){
				Log.d(TAG, "\tSent PUSH to view: " + callBack);
				callBack = "javascript:" + notificationCallBack + "(" + jo.toString() + ")";
				gWebView.sendJavascript(callBack);
//				if (preference.getFCMData().length() != 0){
//					JSONObject json = new JSONObject();
//					JSONArray jsonArray = new JSONArray(preference.getFCMData());
//						for(int n = 0; n < jsonArray.length(); n++){
//                           json = jsonArray.getJSONObject(n);
//                           callBack = "javascript:" + notificationCallBack + "(" + json.toString() + ")";
//                           //Log.d(TAG, "callBack :  => " + callBack);
//                           gWebView.sendJavascript(callBack);
//                           Thread.sleep(5000);
//                        }
//                    preference.saveFCMData("");
//				}

			}else {
//				JSONArray finalArray = new JSONArray();
//				JSONObject json = new JSONObject();
//
//				for (String key : payload.keySet()) {
//               		//Log.d(TAG, "\tpayload: " + key + " => " + payload.get(key));
//                	json.put(key, payload.get(key));
//                }
//
//				finalArray.put(json);
//
//				if (preference.getFCMData().length() != 0){
//						JSONArray jsonArray = new JSONArray(preference.getFCMData());
//						for(int n = 0; n < jsonArray.length(); n++){
//                            json = jsonArray.getJSONObject(n);
//                            finalArray.put(json);
//                        }
//				}
//              
//                preference.saveFCMData(finalArray.toString());
				hasPermission(context);
				Log.d(TAG, " triggering local notification : Title " + payload  );
                String title = payload.get("Title").toString();
                String message = payload.get("Message").toString();
                generateLocalNotification(context,title,message);
				Log.d(TAG, "\tView not ready. triggering local notification : Title " + title + " Message " + message);
			}
		} catch (JSONException e) {
			e.printStackTrace();
			Log.d(TAG, "\tERROR sendPushToView. SAVED NOTIFICATION: " + e.getMessage());

		}catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	private static void generateLocalNotification(Context objContext, String message, String notficationSubject){
        try {
            if (message != null && message.length() > 0) {
                // Context objContext =  cordovaInterface.getActivity().getApplicationContext();

                intNotificationId = generateNotificationID();
                Intent objIntent = getIntent(objContext); //new Intent(objContext,  objContext.getApplicationContext().getClass());
                PendingIntent pi = PendingIntent.getActivity(objContext, intNotificationId, objIntent,PendingIntent.FLAG_CANCEL_CURRENT);

                NotificationCompat.Builder  n  = new NotificationCompat.Builder ( objContext.getApplicationContext())
                    .setContentTitle(getApplicationName(objContext))
                    .setStyle(new NotificationCompat.BigTextStyle()
                                                          .bigText(notficationSubject))
                    .setContentText(notficationSubject)
                    .setSmallIcon( objContext.getApplicationContext().getApplicationInfo().icon)
                    .setDefaults(Notification.DEFAULT_SOUND)
                    .setContentIntent(pi)
                    .setAutoCancel(true);
                NotificationManager notificationManager =
                    (NotificationManager) objContext.getSystemService( objContext.NOTIFICATION_SERVICE);

                notificationManager.notify(intNotificationId, n.build());
                //callbackContext.success("success");
            } else {
                //callbackContext.error("Expected one non-empty string argument.");
            }
        } catch (Exception e) {
          e.printStackTrace();
        }
    }

    public static Intent getIntent(Context context){

               PackageManager pm = context.getPackageManager();
               Intent LaunchIntent = null;
               String apppack = context.getPackageName();
               String name = "";
               try {
                   if (pm != null) {
                       ApplicationInfo app = context.getPackageManager().getApplicationInfo(apppack, 0);
                       name = (String) pm.getApplicationLabel(app);
                       LaunchIntent = pm.getLaunchIntentForPackage(apppack);
                   }
                    Log.e("getIntent : " ," Application name:" + name );
               } catch (PackageManager.NameNotFoundException e) {
                   e.printStackTrace();
               }
               return LaunchIntent;
       }

       public static String getApplicationName(Context context) {
           int stringId = context.getApplicationInfo().labelRes;
           return context.getString(stringId);
       }

       public static Integer generateNotificationID() {
           int randomInt = 0;
           Random randomGenerator = new Random();
           randomInt = randomGenerator.nextInt(90000);
            Log.e("Generated Notification ID  : " , ""+randomInt);
           return randomInt;
       }

       public static boolean hasPermission(Context context){
		   NotificationManagerCompat notificationManagerCompat = NotificationManagerCompat.from(context);
		   boolean areNotificationsEnabled = notificationManagerCompat.areNotificationsEnabled();
		   Log.e("hasPermission  : " , ""+areNotificationsEnabled);
		   return areNotificationsEnabled;
	   }

	   public static void openSettings(Context context){
		   Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
		   intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		   String apppack = context.getPackageName();
		   Uri uri = Uri.fromParts("package", apppack, null);
		   intent.setData(uri);
		   context.startActivity(intent);
	   }
} 