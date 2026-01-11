import "./AdminHeader.css";

export default function AdminHeader(Props) {
  const { title } = Props;
  return (
    <div className="admin-page-sub-header">
      <h1>{title}</h1>
    </div>
  );
}
