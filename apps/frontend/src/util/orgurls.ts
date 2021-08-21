export function agressoNumberStrToNiva(n: string): string {
    switch (n) {
      case "0":
        return "ORGNIV0";
      case "1":
        return "ORGNIV1";
      case "2":
        return "ORGNIV2";
      case "21":
        return "ORGNIV21";
      case "25":
        return "ORGNIV25";
      case "3":
        return "ORGNIV3";
      case "4":
        return "ORGNIV4";
      default:
        return "ORGENHET";
    }
  }
  
  export function agressoNivaToNumberStr(niva: string): string {
    if (niva === "ORGENHET") {
      return "";
    } else {
      return niva.substr("ORGNIV".length);
    }
  }
  
  export function agressoIdDataToUrl(
    agressoId: string,
    agressoNiva: string
  ): string {
    const niva = agressoNivaToNumberStr(agressoNiva);
    const nivaStr = niva ? niva + "_" : "";
    const agressoIdDataToUrlTmp = nivaStr + agressoId;
    return agressoIdDataToUrlTmp;
  }
  
  export function agressoUrlToData(agressoIdUrl: string): {
    agressoId: string;
    agressoNiva: string;
  } {
    const out = {
      agressoId: "",
      agressoNiva: "",
    };
  
    const arr = agressoIdUrl.split("_");
    if (arr.length !== 2) {
      out.agressoNiva = "ORGENHET";
      out.agressoId = arr[0];
    } else {
      out.agressoNiva = agressoNumberStrToNiva(arr[0]);
      out.agressoId = arr[1];
    }
  
    return out;
  }
  