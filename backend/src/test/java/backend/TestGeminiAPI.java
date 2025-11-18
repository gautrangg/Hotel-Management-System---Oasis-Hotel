package backend;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class TestGeminiAPI {
	public static void main(String[] args) {
		String apiKey = "AIzaSyDkqxc1CR_Zsg86CPo4uUYCowqNLabLvlE";
		String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

		OkHttpClient client = new OkHttpClient.Builder()
				.connectTimeout(30, TimeUnit.SECONDS)
				.writeTimeout(30, TimeUnit.SECONDS)
				.readTimeout(30, TimeUnit.SECONDS)
				.build();

		String jsonBody = """
				{
				  "contents": [{
				    "parts": [{
				      "text": "Hello, how are you?"
				    }]
				  }]
				}
				""";

		RequestBody body = RequestBody.create(jsonBody, MediaType.parse("application/json; charset=utf-8"));

		Request request = new Request.Builder()
				.url(apiUrl + "?key=" + apiKey)
				.post(body)
				.build();

		try (Response response = client.newCall(request).execute()) {
			System.out.println("Response Code: " + response.code());
			System.out.println("Response Body: " + response.body().string());

			if (!response.isSuccessful()) {
				System.err.println("❌ Gemini API Error!");
			} else {
				System.out.println("✅ Gemini API Works!");
			}
		} catch (IOException e) {
			System.err.println("❌ Exception: " + e.getMessage());
			e.printStackTrace();
		}
	}
}

