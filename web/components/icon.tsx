export default function Icon({
  name,
  variant,
  className,
}: {
  name: string;
  variant?: "outlined" | "round" | "sharp" | "two-tone";
  className?: string;
}) {
  return (
    <span
      className={
        `material-icons${variant ? "-" + variant : ""}` +
        (className ? " " + className : "")
      }
    >
      {name}
    </span>
  );
}
