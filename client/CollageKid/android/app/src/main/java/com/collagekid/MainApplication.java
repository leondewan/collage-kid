package com.collagekid;

import android.app.Application;

import com.facebook.react.ReactApplication;
import me.hauvo.thumbnail.RNThumbnailPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.imagepicker.ImagePickerPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.rnfs.RNFSPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.surajit.rnrg.RNRadialGradientPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import org.reactnative.camera.RNCameraPackage;
import com.kevinresol.react_native_sound_recorder.RNSoundRecorderPackage;
import com.punarinta.RNSoundLevel.RNSoundLevel;
import com.mybigday.rnmediameta.RNMediaMetaPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNThumbnailPackage(),
            new RNSoundPackage(),
            new ImagePickerPackage(),
            new PickerPackage(),
            new RNFetchBlobPackage(),
            new ReactVideoPackage(),
            new RNFSPackage(),
            new LinearGradientPackage(),
            new RNRadialGradientPackage(),
            new VectorIconsPackage(),
            new RNCameraPackage(),
            new RNSoundRecorderPackage(),
            new RNSoundLevel(),
            new RNMediaMetaPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
