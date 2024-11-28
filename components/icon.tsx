export default function Icon({
  name,
  variant,
}: {
  name: string;
  variant?: "outlined" | "round" | "sharp" | "two-tone";
}) {
  return (
    <span className={`material-icons${variant ? "-" + variant : ""}`}>
      {name}
    </span>
  );
}
