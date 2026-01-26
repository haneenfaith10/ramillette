
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import CategoryForm from "../../Components/CategoryForm/CategoryForm";
import "./AddCategory.css";

export default function AddCategory() {

  return (
    <div className="admin-add-category-main-container">
      <AdminHeader title="Add Category" />
      <div className="admin-add-category-form-container">
        <CategoryForm mode={'ADD'} />
      </div>
    </div>
  );
}
