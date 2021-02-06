package org.hanbo.boot.rest.repository;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hanbo.boot.rest.models.StickerModel;
import org.hanbo.boot.rest.models.UserModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class SqlRepository {
    @Autowired
    private NamedParameterJdbcTemplate sqlDao;

    @Transactional
    public boolean addStickersFromCode(int userId, String codeTitle) {
        List<Integer> stickerIds = sqlDao.query(SqlStrings.SQL_STICKER_ID_GET_BY_CODE,
                (new MapSqlParameterSource("code_title", codeTitle)),
                (rs) -> {
                    List<Integer> retVal = new ArrayList<>();
                    if (rs != null) {
                        while (rs.next()) {
                            retVal.add(rs.getInt("sticker_id"));
                        }
                    }

                    return retVal;
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

                int retVal = sqlDao.update(SqlStrings.SQL_STICKER_ADD, parameters);
                System.out.println("Rows updated: " + retVal);
            });

            return true;
        } else {
            System.out.println("Sticker to add is invalid. Null Object.");

            return false;
        }
    }

    @Transactional
    public List<StickerModel> findSticker(int userId) {
        List<StickerModel> foundObjs = sqlDao.query(SqlStrings.SQL_STICKER_GET_BY_USER_ID,
                (new MapSqlParameterSource("user_id", userId)),
                (rs) -> {
                    List<StickerModel> retVal = new ArrayList<>();
                    if (rs != null) {
                        while (rs.next()) {
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

                    return retVal;
                });

        return foundObjs;
    }

    @Transactional
    public void addUser(UserModel userToAdd) {
        if (userToAdd != null) {
            Map<String, Object> parameters = new HashMap<>();

            Date dateNow = new Date();

            parameters.put("username", userToAdd.getUsername());
            parameters.put("createdDate", dateNow);
            parameters.put("updatedDate", dateNow);

            int retVal = sqlDao.update(SqlStrings.SQL_USER_ADD, parameters);
            System.out.println("Rows updated: " + retVal);
        } else {
            System.out.println("User to add is invalid. Null Object.");
        }
    }

    @Transactional
    public List<UserModel> findUser(String username) {
        List<UserModel> foundObjs = sqlDao.query(SqlStrings.SQL_USER_GET,
                (new MapSqlParameterSource("username", username)),
                (rs) -> {
                    List<UserModel> retVal = new ArrayList<>();
                    if (rs != null) {
                        while (rs.next()) {
                            UserModel um = new UserModel();
                            um.setUsername(rs.getString("username"));
                            retVal.add(um);
                        }
                    }

                    return retVal;
                });

        return foundObjs;
    }
}
