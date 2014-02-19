if (typeof yasp == 'undefined') yasp = { };

yasp.config = {
  filemanager: {
    defaultDriver: "LOCAL",
    drivers: {
      LOCAL: {
        enabled: true
      },
      SERVER: {
        enabled: false,
        url: ""
      }
    }
  },
  quickshare: {
    enabled: false,
    firebaseurl: "" // see doc/quickshare.md
  },
  loadinitialcode: true
};
