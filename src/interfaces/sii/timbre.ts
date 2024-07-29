// Interfaz del XML CAF que se usa para timbrar los DTEs

export interface CAF {
  RE: string; // Rut Emisor
  RS: string; // Razón Social Emisor
  TD: number; // Tipo de Documento (Guia Despacho: 52)
  RNG: {
    // Rango de Folios
    D: number; // Desde
    H: number; // Hasta
  };
  FA: string; // Fecha de Autorización (YYYY-MM-DD)
  RSAPK: {
    // RSA Public Key (i.e: <RSAPK><M>...</M><E>...</E></RSAPK>)
    M: string; // Modulus (i.e: <M>AM9Vk52Gt92vcFFuctVR+kvTJLS2l4LiOvCEK5h+Sw669E4d7TnYkSK5FrED9rCHvR9yj4jfSgN4grdnX29mzNECAQM=</M>)
    E: string; // Exponent (i.e: <E>AQAB</E>)
  };
  IDK: number; // Identificador de Firma Digital (i.e: <IDK>100</IDK>)
}

export interface CAF_File {
  CAF: CAF; // <CAF>...</CAF>
  RSASK: string; // RSA Signature Key (Private Key) (i.e: <RSASK>-----BEGIN RSA PRIVATE KEY----- MIIBOwIBAAJBAM9Vk52Gt92vcFFuctVR+kvTJLS2l4LiOvCEK5h+Sw669E4d7TnY ... p/Uu+Q/akqjTAiEAjliZIFNZIn5Vx0ecBb3tgmEJNaK1+v2DwypMM5DrdMMCIQCf +MBynUUaR786byTIyiTPICoYB/492av0Ofz9TKZzkw== -----END RSA PRIVATE KEY----- </RSASK>)
  RSAPUBK: string; // RSA Public Key (i.e: <RSAPUBK>-----BEGIN PUBLIC KEY----- MFowDQYJKoZIhvcNAQEBBQADSQAwRgJBAM9Vk52Gt92vcFFuctVR+kvTJLS2l4Li OvCEK5h+Sw669E4d7TnYkSK5FrED9rCHvR9yj4jfSgN4grdnX29mzNECAQM= -----END PUBLIC KEY----- </RSAPUBK>)
}

// Interfaz del XML TED resultante, usa informacion del DTE y el CAF

export interface DD {
  RE: string; // Rut Emisor
  TD: number; // Tipo de Documento (Guia Despacho: 52)
  F: number; // Folio
  FE: string; // Fecha de Emisión (YYYY-MM-DD)
  RR: string; // Rut Receptor
  RSR: string; // Razón Social Receptor
  MNT: number; // Monto Total
  IT1: string; // Item 1 Nombre (i.e producto referencia: "Productos Total (ref): 649039")
  CAF: string; // Código de Autorización de Folios (i.e: <CAF><DA>...</DA><FRMA>...</FRMA></CAF>)
  TSTED: string; // Fecha y Hora de Timbre (YYYY-MM-DDTHH:MM:SS)
}

export interface TED {
  DD: string; // <DD>...</DD>
  FRMT: string; // <FRMT algoritmo="SHA1withRSA">...</FRMT>
}
