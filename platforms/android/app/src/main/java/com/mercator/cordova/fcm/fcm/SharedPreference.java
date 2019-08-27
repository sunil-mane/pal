
package com.mercator.cordova.fcm;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.graphics.Color;


public class SharedPreference {

	private static SharedPreference preference;
	private static SharedPreferences mPreference;
	private static Editor mEditor;
	private static final String SHARED_PERSISTANCE_FILE_NAME = "FCM_PUSH_NOTIFICATION";
	private static final String FCMDATA = "FCM_DATA";


	private SharedPreference(Context context){
		mPreference = context.getSharedPreferences(SHARED_PERSISTANCE_FILE_NAME, Context.MODE_PRIVATE); 
		mEditor = mPreference.edit();
	}

	public static SharedPreference getSharedPreference(Context context){
		if (preference == null){
			preference = new SharedPreference(context);
		}
		return preference;
	}

	public void saveFCMData(String dataAsString){
		mEditor.putString(FCMDATA, dataAsString);
		mEditor.commit();
	}

	public String getFCMData(){
		return mPreference.getString(FCMDATA, "");
	}


}
