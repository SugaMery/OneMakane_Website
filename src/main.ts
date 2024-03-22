import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


let bootstrapPromise = platformBrowserDynamic().bootstrapModule(AppModule);

// Later in your code, when you want to bootstrap AppModule:
bootstrapPromise.then(() => {
    console.log('AppModule has been bootstrapped successfully!');
}).catch(err => {
    console.error('Error during bootstrap:', err);
});