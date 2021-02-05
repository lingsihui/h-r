package org.hanbo.boot.rest.repository;

import org.hanbo.boot.rest.models.StickerModel;
import org.hanbo.boot.rest.models.UserModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Repository
public class UserRepository
{
   @Autowired
   private NamedParameterJdbcTemplate sqlDao;
   
   private final String addUser_sql = "INSERT INTO users (username, createdate, updatedate)"
      + " VALUES (:username, :createdDate, :updatedDate)";
   
   private final String getUsers_sql = "SELECT id,"
      + " username,"
      + " createdate,"
      + " updatedate FROM users WHERE username = :username";

   @Transactional
   public void addUser(UserModel userToAdd)
   {
      if (userToAdd != null)
      {
         Map<String, Object> parameters = new HashMap<>();

         Date dateNow = new Date();
         
         parameters.put("username", userToAdd.getUsername());
         parameters.put("createdDate", dateNow);
         parameters.put("updatedDate", dateNow);
         
         int retVal = sqlDao.update(addUser_sql, parameters);
         System.out.println("Rows updated: " + retVal);
      }
      else
      {
         System.out.println("User to add is invalid. Null Object.");
      }
   }
   
   @Transactional
   public List<UserModel> findUser(String username)
   {
      List<UserModel> foundObjs = sqlDao.query(getUsers_sql,
         (new MapSqlParameterSource("username", username)),
         (rs) -> {
            List<UserModel> retVal = new ArrayList<>();
            if (rs != null)
            {
               while(rs.next())
               {  
                  UserModel um = new UserModel();
                  um.setUsername(rs.getString("username"));
                  retVal.add(um);
               }  
            }
            
            return  retVal;
         });
      
      return foundObjs;
   }
}
