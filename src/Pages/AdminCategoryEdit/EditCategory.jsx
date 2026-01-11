
import { useEffect, useState } from "react";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import CategoryForm from "../../Components/CategoryForm/CategoryForm";
import { getCategoryById } from "../../services/categoryApiServices";
import { useParams } from "react-router-dom";
export default function EditCategory() {
   const { id } = useParams();
   const [categoryData, setCategoryData]  =  useState({});
   useEffect(()=>{
    if(id){
       getCategoryById(setCategoryData,id)
    }
   },[id])
   
  return (
    <div className="admin-add-category-main-container">
      <AdminHeader title="Update Category" />
      <CategoryForm mode={'EDIT'} categoryData={categoryData} categoryId={id}/>
    </div>
  );
}
