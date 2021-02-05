package org.hanbo.boot.rest.models;

public class CodeModel
{
   private String title;

   private int userId;

   public int getUserId() {
      return userId;
   }

   public void setUserId(int userId) {
      this.userId = userId;
   }

   public String getTitle() {
      return title;
   }

   public void setTitle(String title) {
      this.title = title;
   }
}
