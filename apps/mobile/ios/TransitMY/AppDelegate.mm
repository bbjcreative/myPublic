#import "AppDelegate.h"
#import <Foundation/Foundation.h>
#import <React/RCTBundleURLProvider.h>
#import <GoogleMaps/GoogleMaps.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Google Maps SDK — key is read from Info.plist (GMSApiKey), injected at build time by EAS
  NSString *mapsApiKey = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"GMSApiKey"];
  [GMSServices provideAPIKey:mapsApiKey];

  self.moduleName = @"TransitMY";
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
