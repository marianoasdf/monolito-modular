import Link from "next/link";

export default function NotFound(): React.JSX.Element {
  return (
    <section className="cta-card">
      <p className="eyebrow">No encontrado</p>
      <h2>Ese tenant o página no existe en la demo.</h2>
      <p>
        Cuando conectemos Prisma, esta resolución saldrá de la tabla de tenants y no de un repositorio en memoria.
      </p>
      <div className="hero-actions">
        <Link className="button" href="/">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}