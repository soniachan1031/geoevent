import styles from "./loader.module.css";

export type TLoaderProps = {
  size?: number;
  color?: string;
  spacing?: number;
  className?: string;
};

const Loader: React.FC<TLoaderProps> = ({
  size = 15,
  spacing = 5,
  color,
  className,
}) => {
  return (
    <div
      className={`${styles.loader} flex justify-center *:flex-1 ${className}`}
      style={{ height: size, width: size, gap: spacing }}
    >
      <span className="bg-primary" style={{ background: color }}></span>
      <span className="bg-primary" style={{ background: color }}></span>
      <span className="bg-primary" style={{ background: color }}></span>
    </div>
  );
};

export default Loader;
