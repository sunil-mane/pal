## Steps to change branding and create new build

- Replace files in `docs/**/resources/` and `docs/**/src/` folders with respective files in `app/` folder
- Replace 'src/constants/language.constants.ts' with 'docs/**/src/language.constants.ts'
- In `app/src/assets/resources/app.config.json` file, set proper **environmentType** and **tenantCode** 
- In `app/config.xml` file, change value of id, **version**, **android-versionCode**, **ios-CFBundleVersion** as needed
- For PAL only, copy all files except profile.html from docs/xx/src and paste in app/src respective folders.
- Remove all platforms and add it again.
- In `app/platforms/android/app` folder, add **google-services.json** FCM file from `docs/**/` folder
- And build the app `ionic build <ios/android>`
