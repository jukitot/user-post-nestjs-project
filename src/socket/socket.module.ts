import {Module} from "@nestjs/common";
import {SocketGateway} from "./socket.gatewy";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [SocketGateway],
  exports: [SocketGateway]
})

export class SocketModule {}