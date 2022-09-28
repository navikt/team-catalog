export function agressoNumberStringToNiva(n: string): string {
  switch (n) {
    case "0": {
      return "ORGNIV0";
    }
    case "1": {
      return "ORGNIV1";
    }
    case "2": {
      return "ORGNIV2";
    }
    case "21": {
      return "ORGNIV21";
    }
    case "25": {
      return "ORGNIV25";
    }
    case "3": {
      return "ORGNIV3";
    }
    case "4": {
      return "ORGNIV4";
    }
    default: {
      return "ORGENHET";
    }
  }
}

export function agressoNivaToNumberString(niva: string): string {
  return niva === "ORGENHET" ? "" : niva.slice("ORGNIV".length);
}

export function agressoIdDataToUrl(agressoId: string, agressoNiva: string): string {
  const niva = agressoNivaToNumberString(agressoNiva);
  const nivaString = niva ? niva + "_" : "";
  return nivaString + agressoId;
}

export function agressoUrlToData(agressoIdUrl: string): {
  agressoId: string;
  agressoNiva: string;
} {
  const out = {
    agressoId: "",
    agressoNiva: "",
  };

  const array = agressoIdUrl.split("_");
  if (array.length !== 2) {
    out.agressoNiva = "ORGENHET";
    out.agressoId = array[0];
  } else {
    out.agressoNiva = agressoNumberStringToNiva(array[0]);
    out.agressoId = array[1];
  }

  return out;
}
