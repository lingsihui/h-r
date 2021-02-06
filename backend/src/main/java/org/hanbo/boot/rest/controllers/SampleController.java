package org.hanbo.boot.rest.controllers;

import java.util.ArrayList;
import java.util.List;

import org.hanbo.boot.rest.models.CodeModel;
import org.hanbo.boot.rest.models.StickerModel;
import org.hanbo.boot.rest.models.GenericResponse;
import org.hanbo.boot.rest.models.UserModel;
import org.hanbo.boot.rest.repository.SqlRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SampleController {
    @Autowired
    private SqlRepository sqlRepo;

    @RequestMapping(value = "/public/stickers/add", method = RequestMethod.POST)
    public ResponseEntity<GenericResponse> addStickers(
            @RequestBody CodeModel stickersCode) {
        GenericResponse retMsg = new GenericResponse();
        if (stickersCode != null) {
            try {
                boolean isValid = sqlRepo.addStickersFromCode(stickersCode.getUserId(), stickersCode.getTitle());

                retMsg.setSuccess(true);
                if (isValid) {
                    retMsg.setStatusCode(1);
                    retMsg.setStatusMsg("Operation is successful. Stickers added.");
                } else {
                    retMsg.setStatusCode(2);
                    retMsg.setStatusMsg("Code invalid.");
                }

            } catch (Exception ex) {
                ex.printStackTrace();
                retMsg.setSuccess(false);
                retMsg.setStatusCode(0);
                retMsg.setStatusMsg("Exception occurred.");
            }
        } else {
            retMsg.setSuccess(false);
            retMsg.setStatusCode(0);
            retMsg.setStatusMsg("No valid sticker model object to be added");
        }

        ResponseEntity<GenericResponse> retVal;
        retVal = ResponseEntity.ok(retMsg);
        return retVal;
    }

    @RequestMapping(value = "/public/stickers/get", method = RequestMethod.GET)
    public ResponseEntity<List<StickerModel>> getStickers(
            @RequestParam("userId") int userId) {
        List<StickerModel> foundStickers = sqlRepo.findSticker(userId);

        if (foundStickers == null) {
            foundStickers = new ArrayList<>();
        }

        ResponseEntity<List<StickerModel>> retVal;
        retVal = ResponseEntity.ok(foundStickers);
        return retVal;
    }

    @RequestMapping(value = "/public/user/add", method = RequestMethod.POST)
    public ResponseEntity<GenericResponse> addUser(
            @RequestBody UserModel userToAdd) {
        GenericResponse retMsg = new GenericResponse();
        if (userToAdd != null) {
            try {
                sqlRepo.addUser(userToAdd);

                retMsg.setSuccess(true);
                retMsg.setStatusCode(1);
                retMsg.setStatusMsg("Operation is successful.");
            } catch (Exception ex) {
                ex.printStackTrace();
                retMsg.setSuccess(false);
                retMsg.setStatusCode(0);
                retMsg.setStatusMsg("Exception occurred.");
            }
        } else {
            retMsg.setSuccess(false);
            retMsg.setStatusCode(0);
            retMsg.setStatusMsg("No valid user model object to be added");
        }

        ResponseEntity<GenericResponse> retVal;
        retVal = ResponseEntity.ok(retMsg);
        return retVal;
    }
}
