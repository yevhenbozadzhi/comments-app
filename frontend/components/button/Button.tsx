type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  icon?: React.ReactNode;
};

export const Button = ({
  children,
  onClick,
  disabled,
  type,
  loading,
  icon,
}: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
};
