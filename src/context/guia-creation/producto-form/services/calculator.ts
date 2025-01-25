export class Calculator {
  static volumenClaseDiametrica(
    clase: string,
    cantidad: number,
    largo: number
  ): number {
    if (!cantidad || !largo) return 0;

    // Formula: cantidad * (clase^2) * largo * (1/10000)
    // The 1/10000 factor converts from cm² to m²
    return parseFloat(
      (cantidad * Math.pow(parseFloat(clase), 2) * largo * (1 / 10000)).toFixed(4)
    );
  }

  static volumenBanco(
    altura1: number,
    altura2: number,
    ancho: number,
    largoBanco: number = 2.44
  ): number {
    if (!altura1 || !altura2 || !ancho) return 0;

    // Formula: ((altura1 + altura2) / 2) * ancho * largoBanco
    // Convert from cm to m
    return parseFloat(
      (((altura1 * 0.01 + altura2 * 0.01) / 2) * ancho * 0.01 * largoBanco).toFixed(4)
    );
  }

  static calculateTotalVolumen(
    tipo: 'Aserrable' | 'Pulpable' | null,
    clases_diametricas: { volumen_emitido: number }[] | null,
    bancos: { volumen_banco: number }[] | null
  ): number {
    if (!tipo) return 0;

    if (tipo === 'Aserrable' && clases_diametricas) {
      return clases_diametricas.reduce(
        (total, clase) => total + (clase.volumen_emitido || 0),
        0
      );
    }

    if (tipo === 'Pulpable' && bancos) {
      return bancos.reduce((total, banco) => total + (banco.volumen_banco || 0), 0);
    }

    return 0;
  }
}
