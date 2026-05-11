import {
  NotificationMessage,
  NotificationSender,
} from "../application/contracts/NotificationSender";

export class ConsoleNotificationSender implements NotificationSender {
  async send(message: NotificationMessage): Promise<void> {
    console.info("notification", message);
  }
}