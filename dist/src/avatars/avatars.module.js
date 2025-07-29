"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const avatars_service_1 = require("./avatars.service");
const avatars_controller_1 = require("./avatars.controller");
const avatar_schema_1 = require("./schemas/avatar.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const file_upload_validator_1 = require("./validators/file-upload.validator");
const platform_express_1 = require("@nestjs/platform-express");
const custom_file_validators_1 = require("./validators/custom-file-validators");
let AvatarsModule = class AvatarsModule {
};
exports.AvatarsModule = AvatarsModule;
exports.AvatarsModule = AvatarsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: avatar_schema_1.Avatar.name, schema: avatar_schema_1.AvatarSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema }
            ]),
            platform_express_1.MulterModule.register({
                dest: './temp',
                limits: {
                    fileSize: 1.5 * 1024 * 1024,
                    files: 1,
                },
            }),
        ],
        controllers: [avatars_controller_1.AvatarsController],
        providers: [
            avatars_service_1.AvatarsService,
            file_upload_validator_1.FileUploadValidator,
            custom_file_validators_1.CustomFileTypeValidator,
            custom_file_validators_1.CustomMaxFileSizeValidator,
            custom_file_validators_1.ImageDimensionsValidator
        ],
        exports: [
            avatars_service_1.AvatarsService,
            file_upload_validator_1.FileUploadValidator,
            custom_file_validators_1.CustomFileTypeValidator,
            custom_file_validators_1.CustomMaxFileSizeValidator,
            custom_file_validators_1.ImageDimensionsValidator
        ]
    })
], AvatarsModule);
//# sourceMappingURL=avatars.module.js.map