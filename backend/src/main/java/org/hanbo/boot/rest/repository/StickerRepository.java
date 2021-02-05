package org.hanbo.boot.rest.repository;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hanbo.boot.rest.models.StickerModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class StickerRepository
{
   @Autowired
   private NamedParameterJdbcTemplate sqlDao;

   @Transactional
   public void addStickersFromCode(int userId, String codeTitle)
   {
      String addSticker_sql = "INSERT INTO user_stickers (user_id, sticker_id, x, y, z, angle, createdate, updatedate)"
              + " VALUES (:user_id, :sticker_id, :x, :y, :z, :angle, :createdDate, :updatedDate)";

      String getStickerIds_sql = "SELECT sticker_id"
              + "FROM codes"
              + "WHERE title = :code_title";

      List<Integer> stickerIds = sqlDao.query(getStickerIds_sql,
              (new MapSqlParameterSource("code_title", codeTitle)),
              (rs) -> {
                 List<Integer> retVal = new ArrayList<>();
                 if (rs != null)
                 {
                    while(rs.next())
                    {
                       retVal.add(rs.getInt("sticker_id"));
                    }
                 }

                 return  retVal;
              });

      assert stickerIds != null;

      if (stickerIds.size() > 0) {
         stickerIds.forEach(stickerId -> {
            Map<String, Object> parameters = new HashMap<>();

            Date dateNow = new Date();

            parameters.put("user_id", userId);
            parameters.put("sticker_id", stickerId);
            parameters.put("x", 0);
            parameters.put("y", 0);
            parameters.put("z", 0);
            parameters.put("angle", 0);
            parameters.put("createdDate", dateNow);
            parameters.put("updatedDate", dateNow);

            int retVal = sqlDao.update(addSticker_sql, parameters);
            System.out.println("Rows updated: " + retVal);
         });
      }
      else
      {
         System.out.println("Sticker to add is invalid. Null Object.");
      }
   }
   
   @Transactional
   public List<StickerModel> findSticker(int userId)
   {
      String getStickers_sql = "SELECT us.id,"
              + " us.x,"
              + " us.y,"
              + " us.z,"
              + " us.angle,"
              + " s.height,"
              + " s.width,"
              + " s.src,"
              + " us.createdate,"
              + " us.updatedate"
              + "FROM user_stickers AS us "
              + "INNER JOIN sticker AS s ON us.sticker_id == s.id"
              + "WHERE us.user_id = :user_id "
              + "ORDER BY us.z";

      List<StickerModel> foundObjs = sqlDao.query(getStickers_sql,
         (new MapSqlParameterSource("user_id", userId)),
         (rs) -> {
            List<StickerModel> retVal = new ArrayList<>();
            if (rs != null)
            {
               while(rs.next())
               {  
                  StickerModel sm = new StickerModel();
                  sm.setId(rs.getInt("us.id"));
                  sm.setX(rs.getInt("us.x"));
                  sm.setY(rs.getInt("us.y"));
                  sm.setZ(rs.getInt("us.z"));
                  sm.setAngle(rs.getInt("us.angle"));
                  sm.setHeight(rs.getInt("s.height"));
                  sm.setWidth(rs.getInt("s.width"));
                  sm.setSrc(rs.getString("s.src"));
                  retVal.add(sm);
               }  
            }
            
            return  retVal;
         });
      
      return foundObjs;
   }
}
