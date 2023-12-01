function notifyCli( payload ) {
    console.log('message', payload);
    const data = payload.data.json();       //data.notification: {title, body, tag}

    console.log('message data', data);
    self.registration.showNotification(data.title, data.options);
};  //_notify

self.addEventListener("push", notifyCli);
