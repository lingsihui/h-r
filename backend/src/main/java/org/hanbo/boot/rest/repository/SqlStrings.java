package org.hanbo.boot.rest.repository;

public class SqlStrings {
    public static final String SQL_STICKER_ADD = "INSERT INTO user_stickers (user_id, sticker_id, x, y, z, angle, createdate, updatedate)"
            + " VALUES (:user_id, :sticker_id, :x, :y, :z, :angle, :createdDate, :updatedDate)";

    public static final String SQL_STICKER_ID_GET_BY_CODE = "SELECT sticker_id"
            + "FROM codes"
            + "WHERE title = :code_title";

    public static final String SQL_STICKER_GET_BY_USER_ID = "SELECT us.id,"
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
            + "INNER JOIN sticker AS s "
            + "ON us.sticker_id == s.id"
            + "WHERE us.user_id = :user_id "
            + "ORDER BY us.z";

    public static final String SQL_USER_ADD = "INSERT INTO users (username, createdate, updatedate)"
            + " VALUES (:username, :createdDate, :updatedDate)";

    public static final String SQL_USER_GET = "SELECT id,"
            + " username,"
            + " createdate,"
            + " updatedate FROM users WHERE username = :username";
}
